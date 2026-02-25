<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function enviarCorreo(
    $subject, 
    $body, 
    $address, 
    $attachment = null,
    $isHTML = true,
) {
    $mail = new PHPMailer(true);

    // Configurar los ajustes del servidor SMTP y del correo electrónico
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->SMTPOptions = array(
        "ssl" => array(
            "verify_peer" => false,
            "verify_peer_name" => false,
            "allow_self_signed" => false
        )
    );
    $mail->Host = $_ENV["MAIL_HOST"];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV["MAIL_ADDRESS"];
    $mail->Password = $_ENV["MAIL_PASSWORD"];
    $mail->SMTPSecure = "";
    $mail->Port = 25;

    $mail->CharSet = "UTF-8";
    $mail->Encoding = "base64";
    $mail->addCustomHeader("Content-Type: text/html; charset=UTF-8");
    $mail->SMTPDebug = 0;

    // Configurar los destinatarios, el asunto y el cuerpo del correo electrónico
    $mail->setFrom($mail->Username, $_ENV["MAIL_NAME"]);
    if (is_array($address) && !empty($address)) {
        foreach ($address as $email) {
            $mail->addAddress($email);
        }
    } else if (is_string($address)) {
        $mail->addAddress($address);
    } else return null;

    if ($attachment) {
        $mail->addAttachment($attachment);
    }

    $mail->isHTML($isHTML);
    $mail->Subject = $subject;
    $mail->Body = $body;
    return $mail->send();
}

function obtenerMailCompartirVideo() {
    return file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/core/vms/videos/video_compartido.html');
}

function replaceEmailData($htmlContent, $datos_mail) {
    $datos_boton = isset($datos_mail['link_descarga'])
        ? "<a href='{$datos_mail['link_descarga']}' target='_blank' 
		style='
		background-color: #b22e24;
		color: white;
		padding: 15px 25px;
		text-decoration: none;
		border-radius: 5px;
		font-size: 16px;
		'>
			Accede al video
		</a>"
        : '';
    $htmlContent = str_replace('[Nombre del Usuario Inicial]', $datos_mail['usuario_inicial'] ?? '', $htmlContent);
    $htmlContent = str_replace('[Nombre del Compartido]', $datos_mail['usuario_compartido'] ?? '', $htmlContent);
    $htmlContent = str_replace('[Boton Descarga]', $datos_boton ?? '', $htmlContent);
    $htmlContent = str_replace('[Nombre del Dispositivo]', $datos_mail['nom_dispositivo'] ?? '', $htmlContent);
    $htmlContent = str_replace('[Titulo del Video]', $datos_mail['titulo'] ?? '', $htmlContent);

    return $htmlContent;
}

function enviarMailVideoCompartido($datos_envio) {
    $datos_usuario_inicial = obtenerUsuariosParam($datos_envio['usuario_inicial']);
    $datos_usuario_inicial = $datos_usuario_inicial[0];

    if (!isset($datos_envio['email'])) {
        $datos_usuario = obtenerUsuariosParam($datos_envio['usuario_compartido']);
        if (!(!empty($datos_usuario) && !isset($datos_usuario['error'])))
            return false;

        $email = $datos_usuario[0]->email;
    } else {
        $email = $datos_envio['email'];
    }

    $subject = "Te han compartido un video '{$datos_envio['titulo']}'";
    $htmlContent = obtenerMailCompartirVideo();

    $htmlContent = replaceEmailData($htmlContent, [
        'titulo' => $datos_envio['titulo'],
        'nom_dispositivo' => $datos_envio['nom_dispositivo'],
        'link_descarga' => $datos_envio['link_descarga'] ?? null,
        'usuario_inicial' => "{$datos_usuario_inicial->nombre} {$datos_usuario_inicial->apellidos}",
        'usuario_compartido' => isset($datos_usuario) ? $datos_usuario[0]->nombre : null,
    ]);

    enviarCorreo(
        subject: $subject,
        body: $htmlContent,
        address: [$email],
        isHTML: true,
    );
}

