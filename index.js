/* eslint-disable-next-line no-unused-vars */
import dotenv from 'dotenv/config';
import logger from './logger.js';
import {getAccessToken, getParticipantReport, getPastWebinars} from './zoom.js';
import fs from 'node:fs';

import {Parser, transforms} from 'json2csv';

const json2csv = new Parser({
	transforms: [transforms.flatten({objects: true, arrays: true})]
});

const directory = './reports/';

if (!fs.existsSync(directory)) fs.mkdirSync(directory, {recursive: true});

if (!process.env.accountID) logger.warn('accountID missing in .env');
if (!process.env.clientID) logger.warn('clientID missing in .env');
if (!process.env.clientSecret) logger.warn('clientSecret missing in .env');
if (!process.env.webhookSecret) logger.warn('webhookSecret missing in .env');

const accessToken = await getAccessToken();
if (!accessToken) {
	logger.error('Unable to get access token');
	process.exit(1);
}

let webinars = await getPastWebinars(accessToken, []);

for (let i in webinars) {
	let participants = await getParticipantReport(
		accessToken,
		webinars[i].id,
		[]
	);

	if (participants.length === 0) break;

	let webinarCSV = await json2csv.parse(participants);
	let currentDate = new Date().toJSON().slice(0, 10);

	if (!fs.existsSync(`${directory}${currentDate}`))
		fs.mkdirSync(`${directory}${currentDate}`, {recursive: true});

	fs.writeFileSync(
		`${directory}${currentDate}/${webinars[i].id}-participant-report.csv`,
		webinarCSV,
		'utf8'
	);
}

logger.info('Done.');
