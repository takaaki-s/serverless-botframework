import * as Express from 'express';
import * as BodyParser from 'body-parser';
import * as AwsServerlessExpressMiddleware from 'aws-serverless-express/middleware';

const app = Express();

app.set('view engine', 'pug');
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(AwsServerlessExpressMiddleware.eventContext());

export default app;
