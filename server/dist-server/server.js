import app from "./app";
import { env } from "./config/env";
app.listen(env.PORT, env.HOST, () => {
    process.stdout.write(`Server listening on http://${env.HOST}:${env.PORT}/api\n`);
});
