Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$prompt = New-Object System.Speech.Synthesis.PromptBuilder

# Conversation Dialogue:
# David (Microsoft David Desktop) and Sarah (Microsoft Zira Desktop)
# Topic: Introducing Yourself (Daily Conversations)

# Line 1: David
$prompt.StartVoice("Microsoft David Desktop")
$prompt.AppendText("Hello! My name is David. It is very nice to meet you.")
$prompt.EndVoice()
$prompt.AppendBreak([TimeSpan]::FromMilliseconds(600))

# Line 2: Sarah
$prompt.StartVoice("Microsoft Zira Desktop")
$prompt.AppendText("Hi David! I am Sarah. Nice to meet you too.")
$prompt.EndVoice()
$prompt.AppendBreak([TimeSpan]::FromMilliseconds(600))

# Line 3: David
$prompt.StartVoice("Microsoft David Desktop")
$prompt.AppendText("Where are you from, Sarah?")
$prompt.EndVoice()
$prompt.AppendBreak([TimeSpan]::FromMilliseconds(500))

# Line 4: Sarah
$prompt.StartVoice("Microsoft Zira Desktop")
$prompt.AppendText("I am originally from Chicago, but I currently live in New York. How about you?")
$prompt.EndVoice()
$prompt.AppendBreak([TimeSpan]::FromMilliseconds(600))

# Line 5: David
$prompt.StartVoice("Microsoft David Desktop")
$prompt.AppendText("I was born in London, but I moved to New York two years ago for work. What do you like to do in your free time?")
$prompt.EndVoice()
$prompt.AppendBreak([TimeSpan]::FromMilliseconds(600))

# Line 6: Sarah
$prompt.StartVoice("Microsoft Zira Desktop")
$prompt.AppendText("I love reading novels and doing photography on weekends. And you, David?")
$prompt.EndVoice()
$prompt.AppendBreak([TimeSpan]::FromMilliseconds(600))

# Line 7: David
$prompt.StartVoice("Microsoft David Desktop")
$prompt.AppendText("In my free time, I really enjoy playing acoustic guitar and cooking Italian food. It was great talking with you, Sarah!")
$prompt.EndVoice()
$prompt.AppendBreak([TimeSpan]::FromMilliseconds(600))

# Line 8: Sarah
$prompt.StartVoice("Microsoft Zira Desktop")
$prompt.AppendText("Great talking with you too, David! Have a wonderful day!")
$prompt.EndVoice()

$outDir = Join-Path $PSScriptRoot "..\public\audio"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$outputFile = Join-Path $outDir "daily-conversations-introducing-yourself.wav"
$synth.SetOutputToWaveFile($outputFile)
$synth.Speak($prompt)
$synth.Dispose()

Write-Host "Synthesized audio to $outputFile"
$fileInfo = Get-Item $outputFile
Write-Host "File size: $($fileInfo.Length) bytes"
