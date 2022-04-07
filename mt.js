var materials = {
    'file_names': [
        "https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/trials/trial1.png",
        "https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/trials/trial2.png",
        "https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/trials/trial3.png",
    ],
    'xstarts': [134, 134, 277],
    'ystarts': [218.5, 218.5, 205],
    'xends': [326, 320, 231.5],
    'yends': [218.5, 126, 209],
    'duration': [2, 2, 7]
}

var buzzer = new Audio('https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/audio/buzzer.mp3');

// Image dimensions
var width = 400;
var height = 300;

function do_mirror(trialnumber) {
    prevInline = false;

    // Load materials
    var imagePath = materials.file_names[trialnumber];
    var xstart = materials.xstarts[trialnumber];
    var ystart = materials.ystarts[trialnumber];;
    var xend = materials.xends[trialnumber];
    var yend = materials.yends[trialnumber];
    var trialDuration = materials.duration[trialnumber];
    var startRadius = 10;
    var inlineHeight = 12;

    var startRect = {
        x: xstart,
        y: ystart,
        width: inlineHeight,
        height: inlineHeight
    }

    var endRect = {
        x: xend,
        y: yend,
        width: inlineHeight,
        height: inlineHeight
    }

    // States to track
    started = false;
    drawing = false;
    finished = false;
    errors = 0;

    // Drawing contexts for cursor area and mirrored area
    var canvas_mirror = document.getElementById('mirror');
    var ctx_mirror = canvas_mirror.getContext('2d');

    var canvas = document.getElementById('paint');
    var ctx = canvas.getContext('2d');

    var canvas_mirror_top = document.getElementById('mirror_top');
    var ctx_mirror_top = canvas_mirror_top.getContext('2d');

    var status_div = document.getElementById('status_div');
    var errors_div = document.getElementById('errors_div');
    var time_div = document.getElementById('time_div');

    status_div.textContent = "Click on the green circle to start the task."

    // Debug
    // var mirror_xy = document.getElementById('mirror_xy');
    // var paint_xy = document.getElementById('paint_xy');
    // var inline_div = document.getElementById('inline_div');
    // var drawing_div = document.getElementById('drawing_div');

    // Start countdown
    time_div.textContent = "Time: " + trialDuration + ":00";
    let time = trialDuration * 60;
    let timeSpent = 0;
    setInterval(countdown, 1000);

    // Load image
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imagePath;

    image.onload = function () {
        ctx_mirror.drawImage(image, 0, 0, width, height);
        image.style.display = 'none';

        ctx_mirror_top.fillStyle = "red";

        // Debug: Draw start/end rects
        // ctx_mirror_top.fillStyle = "green";
        // ctx_mirror_top.fillRect(startRect.x, startRect.y, startRect.width, startRect.height);
        // ctx_mirror_top.fillStyle = "red";
        // ctx_mirror_top.fillRect(endRect.x, endRect.y, endRect.width, endRect.height);

        // Draw start circle
        drawCircle(ctx, width - xstart + inlineHeight, height - ystart, startRadius, 'green');
    };

    // Mouse Capturing
    canvas.addEventListener('mousemove', function (event) {

        var paint_pos = getMousePos(event, canvas);

        ctx_mirror_top.fillRect(width - paint_pos.x, height - paint_pos.y, 3, 3);

        // Debug: Coordinates
        // mirror_xy.textContent = "Mirror: X=" + (width - paint_pos.x) + " Y=" + (height - paint_pos.y);
        // paint_xy.textContent = "Paint: X=" + paint_pos.x + " Y=" + paint_pos.y;

        inline = checkInline(event, width - paint_pos.x, height - paint_pos.y);

        if (started) {

            if (pointIsInRect(width - paint_pos.x, height - paint_pos.y, startRect) && !finished) {
                drawing = true;
                prevInline = true;

                status_div.textContent = "Stay within the black area."

                ctx_mirror_top.clearRect(0, 0, width, height);
            }

            if (drawing && !finished) {
                ctx_mirror_top.fillStyle = "green";

                if (inline != prevInline && prevInline) {
                    throwError();
                }

                if (pointIsInRect(width - paint_pos.x, height - paint_pos.y, endRect)) {
                    drawing = false;
                    finished = true;

                    ctx_mirror_top.fillStyle = "transparent";
                    status_div.textContent = "Task FINISHED!";
                }
            }

            if (finished) {
                ctx_mirror_top.fillStyle = "transparent";
            }

        }

        // Debug: Drawing
        // drawing_div.textContent = "Drawing: " + drawing;

        // Start task with mouse click
        canvas.addEventListener('mousedown', function (event) {

            currentRadius = Math.sqrt(Math.pow(width - paint_pos.x - xstart + inlineHeight, 2) + Math.pow(height - paint_pos.y - ystart, 2));

            if (currentRadius < startRadius) {
                started = true;
                ctx_mirror_top.clearRect(0, 0, width, height);
                ctx.clearRect(0, 0, width, height);

                status_div.textContent = "Start the task at the green triangle."
            }

        }, false);

    }, false);

    function countdown() {

        if (started && !finished) {
            const minutes = Math.floor(time / 60);
            let seconds = time % 60;

            leadingNull = '';

            if (seconds < 10) {
                leadingNull = 0;
            }

            time_div.textContent = "Time: " + minutes + ":" + leadingNull + seconds;

            time--;
            timeSpent = trialDuration * 60 - time;

            if (minutes <= 0 && seconds <= 0) {
                time_div.textContent = "Time: 0:00";
                status_div.textContent = "Maximum time reached. Task finished.";

                finished = true;
            }
        }

    }

    function checkInline(event, x, y) {
        var pixel = ctx_mirror.getImageData(x, y, 1, 1);
        var data = pixel.data;

        if (data[0] + data[1] + data[2] < 500) {
            // Debug: Inline
            // inline_div.textContent = "Inline: true";
            return true;
        } else {
            // Debug: Inline
            // inline_div.textContent = "Inline: false";
            return false;
        }
    }

    function getMousePos(event, canvas) {
        var rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

        return {
            x: (event.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
            y: (event.clientY - rect.top) * scaleY // been adjusted to be relative to element
        }
    }

    function throwError() {
        errors++;
        prevInline = inline;

        drawing = false;

        buzzer.play();

        ctx_mirror_top.clearRect(0, 0, width, height);
        ctx_mirror_top.fillStyle = "red";

        status_div.textContent = "ERROR! Return to the green triangle."
        errors_div.textContent = "Errors: " + errors;
    }

    function pointIsInRect(x, y, rect) {
        return (x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height);
    }

    function drawCircle(ctx, x, y, r, color) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }

}
