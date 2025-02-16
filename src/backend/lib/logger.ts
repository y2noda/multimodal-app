import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 開発環境の場合はコンソールにも出力
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;

export const securityLogger = {
  logScreenShare: (userId: string, shareType: 'window' | 'tab' | 'desktop') => {
    logger.info('Screen share started', {
      userId,
      shareType,
      timestamp: new Date().toISOString(),
    });
  },

  logDataEncryption: (dataType: string, status: 'success' | 'failure') => {
    logger.info('Data encryption event', {
      dataType,
      status,
      timestamp: new Date().toISOString()
    });
  }
};
