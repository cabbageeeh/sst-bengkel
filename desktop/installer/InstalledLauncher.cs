using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Forms;
class InstalledLauncher {
    [STAThread] static void Main() {
        try {
            string root = AppDomain.CurrentDomain.BaseDirectory;
            string script = Path.Combine(root, "Start-Installed.ps1");
            string powershell = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "WindowsPowerShell", "v1.0", "powershell.exe");
            Process.Start(new ProcessStartInfo(powershell, "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"" + script + "\"") { UseShellExecute = false, CreateNoWindow = true, WorkingDirectory = root });
        } catch(Exception error) { MessageBox.Show(error.Message, "SST Bengkel"); }
    }
}
