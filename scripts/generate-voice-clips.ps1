$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot "public\assets\voices"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$clips = @(
  @{ Character="mia"; Voice="en-US-AnaNeural"; Rate="-4%"; Pitch="+8Hz"; Text="Good morning, Leo!" },
  @{ Character="penny"; Voice="en-US-AnaNeural"; Rate="+2%"; Pitch="+24Hz"; Text="Hello! I'm Penny." },
  @{ Character="archie"; Voice="en-US-GuyNeural"; Rate="+1%"; Pitch="+18Hz"; Text="Hi! What's your name?" },
  @{ Character="narrator"; Voice="en-US-AriaNeural"; Rate="-5%"; Pitch="+0Hz"; Text="You meet a new friend." },
  @{ Character="penny"; Voice="en-US-AnaNeural"; Rate="+2%"; Pitch="+24Hz"; Text="My name is Penny." },
  @{ Character="mia"; Voice="en-US-AnaNeural"; Rate="-4%"; Pitch="+8Hz"; Text="Good afternoon, Leo!" },
  @{ Character="archie"; Voice="en-US-GuyNeural"; Rate="+1%"; Pitch="+18Hz"; Text="Hello! I'm Archie." },
  @{ Character="mia"; Voice="en-US-AnaNeural"; Rate="-4%"; Pitch="+8Hz"; Text="See you tomorrow, Leo!" },
  @{ Character="leo"; Voice="en-US-AndrewNeural"; Rate="-3%"; Pitch="+12Hz"; Text="Good morning, Mia!" },
  @{ Character="leo"; Voice="en-US-AndrewNeural"; Rate="-3%"; Pitch="+12Hz"; Text="Hi, Penny!" },
  @{ Character="leo"; Voice="en-US-AndrewNeural"; Rate="-3%"; Pitch="+12Hz"; Text="My name is Leo." },
  @{ Character="leo"; Voice="en-US-AndrewNeural"; Rate="-3%"; Pitch="+12Hz"; Text="What's your name?" },
  @{ Character="leo"; Voice="en-US-AndrewNeural"; Rate="-3%"; Pitch="+12Hz"; Text="Nice to meet you!" },
  @{ Character="leo"; Voice="en-US-AndrewNeural"; Rate="-3%"; Pitch="+12Hz"; Text="Good afternoon, Mia!" },
  @{ Character="leo"; Voice="en-US-AndrewNeural"; Rate="-3%"; Pitch="+12Hz"; Text="I'm Leo." },
  @{ Character="leo"; Voice="en-US-AndrewNeural"; Rate="-3%"; Pitch="+12Hz"; Text="Goodbye, Mia!" }
)

@("one","two","three","four","five","six") | ForEach-Object {
  $clips += @{ Character="penny"; Voice="en-US-AnaNeural"; Rate="-5%"; Pitch="+24Hz"; Text=$_ }
}
@("red","blue","yellow","green","purple","orange") | ForEach-Object {
  $clips += @{ Character="mia"; Voice="en-US-AnaNeural"; Rate="-7%"; Pitch="+8Hz"; Text=$_ }
}
@("Brilliant!","Fantastic!","Amazing!","Great job!","You did it!") | ForEach-Object {
  $clips += @{ Character="narrator"; Voice="en-US-AriaNeural"; Rate="-2%"; Pitch="+2Hz"; Text=$_ }
  $clips += @{ Character="mia"; Voice="en-US-AnaNeural"; Rate="-2%"; Pitch="+8Hz"; Text=$_ }
  $clips += @{ Character="penny"; Voice="en-US-AnaNeural"; Rate="+2%"; Pitch="+24Hz"; Text=$_ }
}

function Get-ClipName([string]$character, [string]$text) {
  $slug = $text.ToLowerInvariant() -replace "[^a-z0-9]+", "-"
  $slug = $slug.Trim("-")
  return "$character--$slug.mp3"
}

foreach ($clip in $clips) {
  $fileName = Get-ClipName $clip.Character $clip.Text
  $target = Join-Path $outputDir $fileName
  if (Test-Path $target) { continue }
  $outputBase = $target -replace "\.mp3$", ""
  & npx.cmd --yes '@andresaya/edge-tts' synthesize --text $clip.Text --voice $clip.Voice "--rate=$($clip.Rate)" "--pitch=$($clip.Pitch)" --output $outputBase
  if ($LASTEXITCODE -ne 0) { throw "Voice generation failed: $($clip.Text)" }
}

Write-Output "Generated $($clips.Count) voice clips in $outputDir"
