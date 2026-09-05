import { sendTextMessage } from "../services/messagesService";
import { handleWebhookEvent } from "../services/webhookService";
import { readJSON } from "../utils/jsonFile";
import { webhookEventsFile } from "../config/storage";
const testSend = async () => {
    console.log("Testing manual send...");
    try {
        const res = await sendTextMessage({
            phone: "6282392115909",
            message: "Test Manual Reply from script"
        });
        console.log("Send success:", res);
    }
    catch (e) {
        console.error("Send failed:", e.message || e);
    }
};
const testWebhookSimulation = async () => {
    console.log("Testing webhook simulation...");
    // Read last event from webhookEvents.json
    const events = readJSON(webhookEventsFile, []);
    if (events.length === 0) {
        console.log("No events found in webhookEvents.json");
        return;
    }
    const lastEvent = events[events.length - 1];
    console.log("Simulating webhook event:", JSON.stringify(lastEvent, null, 2));
    await handleWebhookEvent(lastEvent);
    console.log("Webhook simulation completed. Check debug.log for details.");
};
const run = async () => {
    await testSend();
    await testWebhookSimulation();
};
run();
