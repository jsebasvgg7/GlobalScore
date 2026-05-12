const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Sube un archivo a Cloudinary y retorna la URL optimizada.
 * @param {File} file - Archivo de imagen
 * @param {string} folder - Subcarpeta dentro de historical (ej: "players", "teams")
 * @returns {Promise<string>} URL pública de Cloudinary
 */
export async function uploadToCloudinary(file, folder = "historical") {

    console.log(CLOUD_NAME);
    console.log(UPLOAD_PRESET);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `globalscore/${folder}`);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Error subiendo a Cloudinary");
    }

    const data = await res.json();

    // Retorna URL con transformación automática: WebP, calidad auto, tamaño limitado
    return data.secure_url.replace(
        "/upload/",
        "/upload/f_auto,q_auto,c_limit,w_1200/"

    );

}