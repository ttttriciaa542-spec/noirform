import './config';
import app from './app';
import { PORT, NODE_ENV } from './config';

app.listen(PORT, () => {
  console.log(`NOIR/FORM API listening on http://localhost:${PORT} (env=${NODE_ENV})`);
});
