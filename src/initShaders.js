
function initShaders(gl, vShaderName, fShaderName) {
    const vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER);
    const fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Failed to initialise shaders');
        return null;
    }
    
    return program;
};

function getShader(gl, shaderName, type) {
    var shader = gl.createShader(type),
        shaderScript = loadFileAJAX(shaderName);

    if (!shaderScript) {
        alert(`Failed to find shader source: ${shaderName}`);
    }

    gl.shaderSource(shader, shaderScript);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function loadFileAJAX(name) {
    const xhr = new XMLHttpRequest();
    const okStatus = document.location.protocol === 'file:' ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
};

