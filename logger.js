import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ filename: 'app.log', level: 'error' })
    ]
});

export default logger;