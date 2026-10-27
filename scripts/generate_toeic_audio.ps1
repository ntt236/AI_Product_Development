Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

$outDir = Join-Path $PSScriptRoot "..\public\audio\toeic"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

function Generate-Wav($filename, [scriptblock]$contentBlock) {
    $prompt = New-Object System.Speech.Synthesis.PromptBuilder
    & $contentBlock $prompt
    $outFile = Join-Path $outDir $filename
    $synth.SetOutputToWaveFile($outFile)
    $synth.Speak($prompt)
    Write-Host "Generated $outFile"
}

# 1. Part 1 - Photo 1
Generate-Wav "part1_photo_1.wav" {
    param($p)
    $p.StartVoice("Microsoft David Desktop")
    $p.AppendText("Number 1. Look at the photograph marked number 1 in your test book.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(500))
    $p.AppendText("A. A man is typing on a laptop computer.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("B. A man is drinking coffee in a cafe.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("C. He is cleaning the glass table.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("D. He is putting on his business suit.")
    $p.EndVoice()
}

# 2. Part 1 - Photo 2
Generate-Wav "part1_photo_2.wav" {
    param($p)
    $p.StartVoice("Microsoft Zira Desktop")
    $p.AppendText("Number 2. Look at the photograph marked number 2 in your test book.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(500))
    $p.AppendText("A. They are walking across the pedestrian crosswalk.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("B. Workers are inspecting blueprints at a construction site.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("C. The engineers are climbing a wooden ladder.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("D. They are planting flowers in the park.")
    $p.EndVoice()
}

# 3. Part 2 - Question 7
Generate-Wav "part2_q7.wav" {
    param($p)
    $p.StartVoice("Microsoft David Desktop")
    $p.AppendText("Number 7. Where did you leave the client contracts?")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(500))
    $p.AppendText("A. Yes, yesterday afternoon.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("B. On the conference room table.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("C. At ten o'clock sharp.")
    $p.EndVoice()
}

# 4. Part 2 - Question 8
Generate-Wav "part2_q8.wav" {
    param($p)
    $p.StartVoice("Microsoft Zira Desktop")
    $p.AppendText("Number 8. When is the keynote presentation scheduled to begin?")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(500))
    $p.AppendText("A. In the main auditorium on the third floor.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("B. Dr. Samantha Vance is speaking.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.AppendText("C. Right after the morning coffee break at ten.")
    $p.EndVoice()
}

# 5. Part 3 - Conversation 1 (Questions 32-34)
Generate-Wav "part3_dialogue_1.wav" {
    param($p)
    $p.StartVoice("Microsoft David Desktop")
    $p.AppendText("Questions 32 through 34 refer to the following conversation.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(500))
    $p.AppendText("Hi Maria, have you received the revised design budget from the marketing department yet?")
    $p.EndVoice()
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.StartVoice("Microsoft Zira Desktop")
    $p.AppendText("Not yet, James. Sarah called earlier to say she is still waiting for the printer quotation, but she promised to email the spreadsheet by three this afternoon.")
    $p.EndVoice()
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.StartVoice("Microsoft David Desktop")
    $p.AppendText("That is cutting it close. Our team meeting with the vice president is at four. Would you mind preparing the executive summary slides as soon as her file arrives?")
    $p.EndVoice()
    $p.AppendBreak([TimeSpan]::FromMilliseconds(400))
    $p.StartVoice("Microsoft Zira Desktop")
    $p.AppendText("No problem at all. I will clear my schedule and finish the slides immediately.")
    $p.EndVoice()
}

# 6. Part 4 - Short Talk 1 (Questions 71-73)
Generate-Wav "part4_talk_1.wav" {
    param($p)
    $p.StartVoice("Microsoft Zira Desktop")
    $p.AppendText("Questions 71 through 73 refer to the following airport announcement.")
    $p.AppendBreak([TimeSpan]::FromMilliseconds(500))
    $p.AppendText("Attention all passengers traveling on SkyAir Flight 402 with non-stop service to Chicago O'Hare. Due to late arrival of the inbound aircraft and unexpected ground maintenance, our departure has been moved from gate B12 to gate C8. Boarding will now begin at approximately five thirty PM. Passengers needing special assistance or traveling with small children are requested to proceed to gate C8 now. We apologize for the inconvenience and appreciate your patience.")
    $p.EndVoice()
}

$synth.Dispose()
Write-Host "All TOEIC audio assets successfully synthesized!"
