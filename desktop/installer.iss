#ifndef AppVersion
  #define AppVersion "1.1.1"
#endif
#ifndef PayloadDir
  #define PayloadDir "..\tmp\installer-build\payload"
#endif
#ifndef ReleaseDir
  #define ReleaseDir "..\release"
#endif
[Setup]
AppId={{E12DB1E6-C42C-4F10-8C5A-68DD8E346AAC}
AppName=SST Bengkel
AppVersion={#AppVersion}
AppPublisher=SST Bengkel
DefaultDirName={localappdata}\Programs\SSTBengkel
DefaultGroupName=SST Bengkel
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
OutputDir={#ReleaseDir}
OutputBaseFilename=SST-Bengkel-Setup-{#AppVersion}-x64
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
DisableProgramGroupPage=yes
SetupIconFile={#PayloadDir}\public\images\sst-bengkel.ico
UninstallDisplayIcon={app}\public\images\sst-bengkel.ico
CloseApplications=no
RestartApplications=no
SetupLogging=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Buat shortcut di Desktop"; GroupDescription: "Shortcut:"

[Files]
Source: "{#PayloadDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\SST Bengkel"; Filename: "{app}\SST Bengkel.exe"; WorkingDir: "{app}"; IconFilename: "{app}\public\images\sst-bengkel.ico"
Name: "{autodesktop}\SST Bengkel"; Filename: "{app}\SST Bengkel.exe"; WorkingDir: "{app}"; IconFilename: "{app}\public\images\sst-bengkel.ico"; Tasks: desktopicon
Name: "{group}\Folder data dan backup"; Filename: "{localappdata}\SSTBengkel"
Name: "{group}\Hentikan server SST Bengkel"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""{app}\Stop-Installed.ps1"""; Flags: runminimized

[Run]
Filename: "{app}\SST Bengkel.exe"; Description: "Buka SST Bengkel"; Flags: nowait postinstall skipifsilent

[Code]
procedure StopInstalledServer();
var
  ResultCode: Integer;
  ScriptPath: String;
begin
  ScriptPath := ExpandConstant('{app}\Stop-Installed.ps1');
  if FileExists(ScriptPath) then
    Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'),
      '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + ScriptPath + '"',
      ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  StopInstalledServer();
  Result := '';
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usUninstall then StopInstalledServer();
end;
