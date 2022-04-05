var materials = {
    'mirror': [true, true, true, true, true, true, true, true],
    'file_names': [
        "https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/trials/trial1.png",
        "https://raw.githubusercontent.com/mxwebdev/mirror-tracing/main/trials/trial2.png",
    ],
    'xstarts': [131],
    'ystarts': [227.5],
    'xends': [330],
    'yends': [227.5]
}

//image dimensions
var width = 400;
var height = 300;

function do_mirror() {
    prevInline = false;

    //load materials
    var imagePath = materials.file_names[trialnumber];
    mirror = materials.mirror[trialnumber];
    var xstart = materials.xstarts[trialnumber];
    var ystart = materials.ystarts[trialnumber];;
    var startRadius = 10;
    var endRadius = 12;
    var xend = materials.xends[trialnumber];
    var yend = materials.yends[trialnumber];

    // //states to track
    drawing = false;
    finished = false;
    errors = 0;

    //drawing contexts for cursor area and mirrored area
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

    // Debug
    var status = document.getElementById('status');
    var mirror_xy = document.getElementById('mirror_xy');
    var paint_xy = document.getElementById('paint_xy');
    var inline_div = document.getElementById('inline_div');
    var drawing_div = document.getElementById('drawing_div');
    var errors_div = document.getElementById('errors_div');

    // Load image
    image.onload = function () {
        ctx_mirror.drawImage(image, 0, 0, width, height);
        image.style.display = 'none';

        // Draw start circle
        drawCircle(ctx_mirror, xstart, ystart, startRadius, 'green');

        // Draw end circle
        drawCircle(ctx_mirror, xend, yend, endRadius, 'red');
    };

    function checkInline(event, x, y) {
        var pixel = ctx_mirror.getImageData(x, y, 1, 1);
        var data = pixel.data;

        //const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
        //return rgba;

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

    function throwError(inline) {
        if (inline != prevInline) {
            errors++;
            prevInline = inline;

            drawing = false;

            ctx_mirror_top.clearRect(0, 0, width, height);
        }

        errors_div.textContent = "Errors: " + errors;
    }

    // Mouse Capturing
    canvas.addEventListener('mousemove', function (event) {

        var paint_pos = getMousePos(event, canvas);

        ctx_mirror_top.fillStyle = "#4287f5";
        ctx_mirror_top.fillRect(width - paint_pos.x, height - paint_pos.y, 4, 4);

        mirror_xy.textContent = "Mirror: X=" + (width - paint_pos.x) + " Y=" + (height - paint_pos.y);
        paint_xy.textContent = "Paint: X=" + paint_pos.x + " Y=" + paint_pos.y;

        inline = checkInline(event, width - paint_pos.x, height - paint_pos.y);

        currentStartRadius = Math.sqrt(Math.pow(width - paint_pos.x - xstart, 2) + Math.pow(height - paint_pos.y - ystart, 2));
        currentEndRadius = Math.sqrt(Math.pow(width - paint_pos.x - xend, 2) + Math.pow(height - paint_pos.y - yend, 2));

        if (currentStartRadius < startRadius) {
            drawing = true;
        }

        if (drawing && !finished) {

            throwError(inline);

            if (currentEndRadius < endRadius) {
                drawing = false;
                finished = true;

                status.textContent = "Finished!"
            }
        }

        drawing_div.textContent = "Drawing: " + drawing;

    }, false);

    function drawCircle(ctx, x, y, r, color) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }

}
