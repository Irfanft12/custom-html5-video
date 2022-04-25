const video = document.querySelector("#video")
const videoControls = document.querySelector("#video-controls")
const playButton = document.querySelector("#play")
const playbackIcons = document.querySelectorAll(".playback-icons use")
const timeElapsed = document.querySelector("#time-elapsed")
const duration = document.querySelector("#duration")
const progressBar = document.querySelector("#progress-bar")
const seek = document.querySelector("#seek")
const seekTooltip = document.querySelector("#seek-tooltip")

const volumeButton = document.querySelector("#volume-button")
const volumeIcons = document.querySelectorAll(".volume-button use")
const volumeMute = document.querySelector("use[href='#volume-mute']")
const volumeLow = document.querySelector("use[href='#volume-low']")
const volumeHigh = document.querySelector("use[href='#volume-high']")
const volume = document.querySelector("#volume")

const fullscreenButton = document.querySelector("#fullscreen-button")
const videoContainer = document.querySelector("#video-container")

const fullscreenIcons = fullscreenButton.querySelectorAll("use")

const playbackAnimation = document.querySelector("#playback-animation")

const videoWorks = !!document.createElement("video").canPlayType

const pipButton = document.querySelector("#pip-button")



if (videoWorks) {
    video.controls = false
    videoControls.classList.remove("hidden")
}

function togglePlay() {
    if (video.paused || video.ended) {
        video.play()
    } else {
        video.pause()
    }
}

playButton.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)
video.addEventListener("click", animatePlayback)

function updatePlayButton() {
    playbackIcons.forEach(icon => icon.classList.toggle("hidden"))

    if (video.paused) {
        playButton.setAttribute("data-title", "Play (k)")
    } else {
        playButton.setAttribute("data-title", "Pause (k)")
    }

}

video.addEventListener("play", updatePlayButton)
video.addEventListener("pause", updatePlayButton)

function formatTime(timeInseconds) {
    const result = new Date(timeInseconds * 1000).toISOString().substr(11, 8)

    return {
        minutes: result.substr(3, 2),
        seconds: result.substr(6, 2)
    }
}

function initializeVideo() {
    const videoDuration = Math.round(video.duration)
    seek.setAttribute("max", videoDuration)
    progressBar.setAttribute("max", videoDuration)
    const time = formatTime(videoDuration)
    duration.innerText = `${time.minutes}:${time.seconds}`
    duration.setAttribute("dateTime", `${time.minutes}m ${time.seconds}s`)
}

video.addEventListener("loadedmetadata", initializeVideo)

function updateProgress() {
    seek.value = Math.floor(video.currentTime)
    progressBar.value = Math.floor(video.currentTime)
}

function updateTimeElapsed() {
    const time = formatTime(Math.round(video.currentTime))
    timeElapsed.innerText = `${time.minutes}:${time.seconds}`
    timeElapsed.setAttribute("datetime", `${time.minutes}m ${time.seconsds}s`)
}

function updateSeekTooltip(event) {
    const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute("max"), 10))
    seek.setAttribute("data-seek", skipTo)
    const t = formatTime(skipTo)
    seekTooltip.textContent = `${t.minutes}:${t.seconds}`
    const rect = video.getBoundingClientRect()
    seekTooltip.style.left = `${event.pageX - rect.left}px`

}

function skipAhead(event) {
    const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value
    video.currentTime = skipTo
    progressBar.value = skipTo
    seek.value = skipTo
}

function updateVolume() {
    if (video.muted) {
        video.muted = false
    }

    video.volume = volume.value
}

function updateVolumeIcon() {
    volumeIcons.forEach(icon => {
        icon.classList.add("hidden")
    })

    volumeButton.setAttribute("data-title", "Mute (m)")

    if (video.muted || video.volume === 0) {
        volumeMute.classList.remove("hidden")
        volumeButton.setAttribute("data-title", "unmute (m)")
    } else if (video.volume > 0 && video.volume <= 0.5) {
        volumeLow.classList.remove("hidden")
    } else {
        volumeHigh.classList.remove("hidden")
    }
}

function toggleMute() {
    video.muted = !video.muted

    if (video.muted) {
        volume.setAttribute("data-volume", volume.value)
        volume.value = 0
    } else {
        volume.value = volume.dataset.volume
    }
}


function animatePlayback() {
    playbackAnimation.animate([
        {
            opacity: 1,
            transform: "scale(1)"
        },
        {
            opacity: 0,
            transform: "scale(1.3)"
        }
    ], 
    {
        duration: 500
    }
    )
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen()
    } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen()
    } else {
        videoContainer.requestFullscreen()
    }
}

function updateFullscreenButton() {
    fullscreenIcons.forEach(icon => icon.classList.toggle('hidden'));
  
    if (document.fullscreenElement) {
      fullscreenButton.setAttribute('data-title', 'Exit full screen (f)')
    } else {
      fullscreenButton.setAttribute('data-title', 'Full screen (f)')
    }
  }

volume.addEventListener("input", updateVolume)

seek.addEventListener("mousemove", updateSeekTooltip)
seek.addEventListener("input", skipAhead)

video.addEventListener("timeupdate", updateTimeElapsed)
video.addEventListener("timeupdate", updateProgress)
video.addEventListener("volumechange", updateVolumeIcon)

volumeButton.addEventListener("click", toggleMute)

fullscreenButton.onclick = toggleFullscreen

// fullscreenButton.onclick = updateFullscreenButton

document.addEventListener("DOMContentLoaded", () => {
    if (!("pictureInPictureEnabled" in document)) {
        pipButton.classList.add("hidden")
    }
})

async function togglePip() {
    try {
        if (video !== document.pictureInPictureElement) {
            pipButton.disabled = true
            await video.requestPictureInPicture()
        } else {
            await document.exitPictureInPicture()
        }
    } catch (error) {
        console.error(error)
    } finally {
        pipButton.disabled = false
    }
}

pipButton.onclick = togglePip

function hideControls() {
    if (video.paused) {
        return
    }

    videoControls.classList.add("hide")
}

function showControls() {
    videoControls.classList.remove("hide")
}

video.onmouseleave = hideControls
video.onmouseenter = showControls
videoControls.onmouseleave = hideControls
videoControls.onmouseenter = showControls

function keyboardShortcuts(event) {
    switch(event.key) {
        case "k" :
            togglePlay()
            animatePlayback()
            if (video.paused) {
                showControls()
            } else {
                setTimeout(() => {
                    hideControls()
                }, 2000)
            }
            break
        case "m":
            toggleMute()
            break
        case "f":
            toggleFullscreen()
            break
        case "p":
            togglePip()
            break
    }
}

document.addEventListener("keyup", keyboardShortcuts)
