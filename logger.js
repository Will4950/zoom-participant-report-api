import winston from 'winston';

let logger = winston.createLogger({});

logger.add(
	new winston.transports.Console({
		level: 'silly',
		format: winston.format.combine(
			winston.format.colorize() /*  */,
			winston.format.timestamp({
				format: 'DD-MM:HH:mm:ss'
			}),
			winston.format.printf(
				(info) => `[${info.timestamp}] [${info.level}] : ${info.message}`
			)
		)
	})
);

export default logger;
