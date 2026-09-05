import { importContacts, addSchedule, processSchedules, getLogs } from "../services/broadcastService";
import path from "path";

const args = process.argv.slice(2);
const command = args[0];

const printUsage = () => {
  console.log(`
Penggunaan CLI Broadcast:
  node server/src/scripts/broadcastCli.ts <command> [options]

Command:
  import <file_path> <message> [timestamp]  Mengimpor kontak dan menjadwalkan pesan
  run <device_id>                            Menjalankan jadwal yang sudah waktunya
  logs                                       Melihat riwayat log pengiriman
  
Contoh:
  node server/src/scripts/broadcastCli.ts import contacts.csv "Halo semua" 1704634200000
  node server/src/scripts/broadcastCli.ts run vc
  node server/src/scripts/broadcastCli.ts logs
  `);
};

async function main() {
  switch (command) {
    case "import": {
      const filePath = args[1];
      const message = args[2];
      const timestamp = args[3] ? parseInt(args[3]) : Date.now();

      if (!filePath || !message) {
        console.error("Error: Path file dan pesan harus diisi.");
        printUsage();
        return;
      }

      try {
        const fullPath = path.resolve(process.cwd(), filePath);
        const contacts = importContacts(fullPath);
        
        if (contacts.length === 0) {
          console.error("Error: Tidak ada kontak valid untuk diimpor.");
          return;
        }

        const schedule = addSchedule({
          timestamp,
          content: { type: "text", message },
          recipients: contacts.map(c => c.phone),
        });

        console.log(`[CLI] Berhasil membuat jadwal (ID: ${schedule.id}) untuk ${contacts.length} kontak.`);
      } catch (error: any) {
        console.error(`[CLI] Error saat import: ${error.message}`);
      }
      break;
    }

    case "run": {
      const deviceId = args[1];
      if (!deviceId) {
        console.error("Error: Device ID harus diisi.");
        printUsage();
        return;
      }

      console.log(`[CLI] Menjalankan broadcast untuk device: ${deviceId}...`);
      try {
        const count = await processSchedules(deviceId);
        console.log(`[CLI] Selesai memproses ${count} jadwal.`);
      } catch (error: any) {
        console.error(`[CLI] Error saat menjalankan broadcast: ${error.message}`);
      }
      break;
    }

    case "logs": {
      const logs = getLogs();
      console.log("\n--- Riwayat Log Broadcast ---");
      logs.slice(-20).forEach(log => {
        console.log(`[${log.timestamp}] [${log.status.toUpperCase()}] ID:${log.schedule_id} - ${log.message}`);
      });
      break;
    }

    default:
      printUsage();
      break;
  }
}

main().catch(console.error);
