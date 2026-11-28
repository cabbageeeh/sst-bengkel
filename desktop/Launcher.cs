using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
class Launcher {
    [STAThread] static void Main() {
        try {
            string root = AppDomain.CurrentDomain.BaseDirectory;
            string script = Path.Combine(root, "desktop", "Start-SST.ps1");
            if (!File.Exists(script)) { MessageBox.Show("Folder desktop/Start-SST.ps1 tidak ditemukan. Simpan aplikasi di folder proyek SST Bengkel.", "SST Bengkel"); return; }
            Process.Start(new ProcessStartInfo("powershell.exe", "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"" + script + "\"") { UseShellExecute = false, CreateNoWindow = true, WorkingDirectory = root });
        } catch (Exception error) { MessageBox.Show(error.Message, "SST Bengkel"); }
    }
}
