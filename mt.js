var materials = {
    'file_names': [
        "https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/trials/trial1.png",
        "https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/trials/trial2.png",
        "https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/trials/trial3.png",
    ],
    'xstarts': [134],
    'ystarts': [227.5],
    'xends': [330],
    'yends': [227.5]
}

var buzzer = new Audio('buzzer.wav');

//image dimensions
var width = 400;
var height = 300;

function do_mirror() {
    prevInline = false;

    //load materials
    var imagePath = materials.file_names[trialnumber];
    var xstart = materials.xstarts[trialnumber];
    var ystart = materials.ystarts[trialnumber];;
    var xend = materials.xends[trialnumber];
    var yend = materials.yends[trialnumber];
    var startRadius = 10;

    var startRect = {
        x: xstart,
        y: ystart - 8,
        width: 4,
        height: 16
    }

    var endRect = {
        x: xend,
        y: yend - 8,
        width: 4,
        height: 16
    }

    // states to track
    started = false;
    drawing = false;
    finished = false;
    errors = 0;

    // drawing contexts for cursor area and mirrored area
    var canvas_mirror = document.getElementById('mirror');
    var ctx_mirror = canvas_mirror.getContext('2d');

    var canvas = document.getElementById('paint');
    var ctx = canvas.getContext('2d');

    var canvas_mirror_top = document.getElementById('mirror_top');
    var ctx_mirror_top = canvas_mirror_top.getContext('2d');

    //load the image to trace
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imagePath;

    var status = document.getElementById('status');

    // Debug
    var mirror_xy = document.getElementById('mirror_xy');
    var paint_xy = document.getElementById('paint_xy');
    var inline_div = document.getElementById('inline_div');
    var drawing_div = document.getElementById('drawing_div');
    var errors_div = document.getElementById('errors_div');

    // Load image
    image.onload = function () {
        ctx_mirror.drawImage(image, 0, 0, width, height);
        image.style.display = 'none';

        // Debug: Draw start/end rects
        ctx_mirror_top.fillStyle = "green";
        ctx_mirror_top.fillRect(startRect.x, startRect.y, startRect.width, startRect.height);
        ctx_mirror_top.fillStyle = "red";
        ctx_mirror_top.fillRect(endRect.x, endRect.y, endRect.width, endRect.height);

        // Draw start circle
        drawCircle(ctx, width - xstart, height - ystart, startRadius, 'green');
    };


    // Mouse Capturing
    canvas.addEventListener('mousemove', function (event) {

        var paint_pos = getMousePos(event, canvas);

        ctx_mirror_top.fillRect(width - paint_pos.x, height - paint_pos.y, 4, 4);

        mirror_xy.textContent = "Mirror: X=" + (width - paint_pos.x) + " Y=" + (height - paint_pos.y);
        paint_xy.textContent = "Paint: X=" + paint_pos.x + " Y=" + paint_pos.y;

        inline = checkInline(event, width - paint_pos.x, height - paint_pos.y);

        if (started) {

            if (pointIsInRect(width - paint_pos.x, height - paint_pos.y, startRect)) {
                drawing = true;
                prevInline = true;
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
                    status.textContent = "Finished!"
                }
            }

        }

        drawing_div.textContent = "Drawing: " + drawing;

        // Start task with mouse click
        canvas.addEventListener('mousedown', function (event) {

            currentRadius = Math.sqrt(Math.pow(width - paint_pos.x - xstart, 2) + Math.pow(height - paint_pos.y - ystart, 2));

            if (currentRadius < startRadius) {
                started = true;
                ctx_mirror_top.clearRect(0, 0, width, height);
                ctx.clearRect(0, 0, width, height);
            }

        }, false);

    }, false);

    function checkInline(event, x, y) {
        var pixel = ctx_mirror.getImageData(x, y, 1, 1);
        var data = pixel.data;

        if (data[0] + data[1] + data[2] < 500) {
            inline_div.textContent = "Inline: true";
            return true;
        } else {
            inline_div.textContent = "Inline: false";
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
