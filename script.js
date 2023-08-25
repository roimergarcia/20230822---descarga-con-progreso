/**
 * Descarga el contenido de una respuesta, informando del avance, 
 * y lo devuelve en forma de Blob.
 * @param {Response} respuesta Objeto respuesta que devuelve el contenido del archivo.
 * @param {function} calbackProgreso callback para informar del avance de al descarga.
 */
const cargarArchivo = async function( respuesta, calbackProgreso){
    let controlador;
    //Flujo qeu almacena el archivo mientras se descarga.
    const flujoLectura = new ReadableStream({
        start(controller){
            controlador = controller;
        }
    });

    /**
     * @type {ReadableStream<Uint8Array>} 
     */
    const lector = respuesta.body.getReader();
    const totalBytes = respuesta.headers.get('content-length');

    let avanceBytes = 0;
    while (true) {
        const { done, value } = await lector.read()
        
        if (done) {
            controlador.close();
            break
        }

        controlador.enqueue(value)

        avanceBytes += value.byteLength;
        calbackProgreso.apply({}, [avanceBytes, totalBytes]);

    }

    const flujoResp = new Response(flujoLectura);

    return await flujoResp.blob();

}

export {cargarArchivo}