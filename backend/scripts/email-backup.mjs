import crypto from 'crypto';
import zlib from 'zlib';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'BACKUP_EMAIL_FROM',
  'BACKUP_EMAIL_TO',
  'BACKUP_EMAIL_APP_PASSWORD',
  'BACKUP_ENCRYPTION_PASSWORD',
];

const TARGET_COLLECTIONS = [
  'users',
  'products',
  'settings',
  'onboardings',
  'closingprices',
];

function assertRequiredEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

function getUtcStamp() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}-${hh}${mm}${ss}Z`;
}

function encryptBuffer(plainBuffer, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    algorithm: 'aes-256-gcm',
    kdf: 'pbkdf2-sha256',
    iterations: 100000,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: encrypted.toString('base64'),
  };
}

async function readCollections(db) {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
  const result = {};

  for (const name of TARGET_COLLECTIONS) {
    if (!existing.has(name)) {
      result[name] = [];
      continue;
    }
    result[name] = await db.collection(name).find({}).toArray();
  }

  return result;
}

async function sendBackupEmail({ attachmentName, attachmentBuffer, stats }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.BACKUP_EMAIL_FROM,
      pass: process.env.BACKUP_EMAIL_APP_PASSWORD,
    },
  });

  const summaryLines = [
    `Mongo backup generated at UTC: ${stats.generatedAt}`,
    `Cluster db name: ${stats.dbName}`,
    `Collections included: ${TARGET_COLLECTIONS.join(', ')}`,
    `Document counts: ${JSON.stringify(stats.counts)}`,
    `JSON size (bytes): ${stats.jsonSize}`,
    `Gzip size (bytes): ${stats.gzipSize}`,
    `Encrypted package size (bytes): ${stats.encryptedSize}`,
    '',
    'Attachment format: encrypted JSON package (AES-256-GCM + PBKDF2-SHA256).',
    'Use BACKUP_ENCRYPTION_PASSWORD (GitHub secret) to decrypt during restore.',
  ];

  await transporter.sendMail({
    from: process.env.BACKUP_EMAIL_FROM,
    to: process.env.BACKUP_EMAIL_TO,
    subject: `[GoldSync] Daily DB Backup ${stats.generatedAt}`,
    text: summaryLines.join('\n'),
    attachments: [
      {
        filename: attachmentName,
        content: attachmentBuffer,
        contentType: 'application/octet-stream',
      },
    ],
  });
}

async function main() {
  assertRequiredEnv();

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
  });

  try {
    const db = mongoose.connection.db;
    const generatedAt = new Date().toISOString();
    const collections = await readCollections(db);

    const counts = Object.fromEntries(
      Object.entries(collections).map(([name, docs]) => [name, Array.isArray(docs) ? docs.length : 0])
    );

    const rawPayload = {
      version: 1,
      generatedAt,
      dbName: db.databaseName,
      collections,
    };

    const jsonBuffer = Buffer.from(JSON.stringify(rawPayload), 'utf8');
    const gzipBuffer = zlib.gzipSync(jsonBuffer, { level: 9 });
    const encryptedPackage = encryptBuffer(gzipBuffer, process.env.BACKUP_ENCRYPTION_PASSWORD);
    const encryptedBuffer = Buffer.from(JSON.stringify(encryptedPackage), 'utf8');

    const stamp = getUtcStamp();
    const attachmentName = `goldsync-db-backup-${stamp}.enc.json`;

    await sendBackupEmail({
      attachmentName,
      attachmentBuffer: encryptedBuffer,
      stats: {
        generatedAt,
        dbName: db.databaseName,
        counts,
        jsonSize: jsonBuffer.length,
        gzipSize: gzipBuffer.length,
        encryptedSize: encryptedBuffer.length,
      },
    });

    console.log('BACKUP_EMAIL_SENT');
    console.log(`Attachment: ${attachmentName}`);
    console.log(`Counts: ${JSON.stringify(counts)}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('BACKUP_JOB_FAILED');
  console.error(err.message);
  process.exit(1);
});
