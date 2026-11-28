# Convert the existing SST logo into a Windows icon at standard shell sizes.
# No Python or image-generation service is required to reproduce this asset.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
if (-not ('SSTIconHandles' -as [type])) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class SSTIconHandles {
    [DllImport("user32.dll")] public static extern bool DestroyIcon(IntPtr handle);
}
"@
}
$project = Split-Path $PSScriptRoot -Parent
$sourcePath = Join-Path $project 'public/images/sst-bengkel-logo.png'
$outputPath = Join-Path $project 'public/images/sst-bengkel.ico'
$source = [System.Drawing.Image]::FromFile($sourcePath)
$frames = New-Object System.Collections.Generic.List[byte[]]
try {
    foreach ($size in @(16,24,32,48,64,128,256)) {
        $bitmap = New-Object System.Drawing.Bitmap($size,$size,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
        $stream = New-Object System.IO.MemoryStream
        $handle = [IntPtr]::Zero
        $icon = $null
        try {
            $graphics.Clear([System.Drawing.Color]::Transparent)
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $edge = [single]($size * .04)
            $diameter = [single]($size * .24)
            $side = [single]($size - 2 * $edge)
            $shape.AddArc($edge,$edge,$diameter,$diameter,180,90)
            $shape.AddArc(($edge+$side-$diameter),$edge,$diameter,$diameter,270,90)
            $shape.AddArc(($edge+$side-$diameter),($edge+$side-$diameter),$diameter,$diameter,0,90)
            $shape.AddArc($edge,($edge+$side-$diameter),$diameter,$diameter,90,90)
            $shape.CloseFigure()
            $graphics.FillPath([System.Drawing.Brushes]::White,$shape)
            $width = [single]($size * .88)
            $height = [single]($width * $source.Height / $source.Width)
            $graphics.DrawImage($source,[single](($size-$width)/2),[single](($size-$height)/2),$width,$height)
            $handle = $bitmap.GetHicon()
            $icon = [System.Drawing.Icon]::FromHandle($handle)
            $icon.Save($stream)
            $frames.Add($stream.ToArray())
        } finally {
            if ($icon) { $icon.Dispose() }
            if ($handle -ne [IntPtr]::Zero) { [SSTIconHandles]::DestroyIcon($handle) | Out-Null }
            $stream.Dispose(); $shape.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
        }
    }
    $file = [System.IO.File]::Create($outputPath)
    $writer = New-Object System.IO.BinaryWriter($file)
    try {
        $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$frames.Count)
        $offset = [uint32](6 + 16 * $frames.Count)
        foreach ($frame in $frames) {
            $writer.Write($frame,6,12)
            $writer.Write($offset)
            $offset += [BitConverter]::ToUInt32($frame,14)
        }
        foreach ($frame in $frames) {
            $length = [BitConverter]::ToUInt32($frame,14)
            $start = [BitConverter]::ToUInt32($frame,18)
            $writer.Write($frame,[int]$start,[int]$length)
        }
    } finally { $writer.Dispose(); $file.Dispose() }
    Write-Output "Windows icon created: $outputPath ($($frames.Count) sizes)"
} finally { $source.Dispose() }
