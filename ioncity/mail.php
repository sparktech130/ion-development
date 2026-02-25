<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\SMTP;

function enviarMailForm(
    $destinatarios, 
    $subject, 
    $body, 
    $isHTML = true,
) {
    try {
        $mail = new PHPMailer(true);

        // Configurar los ajustes del servidor SMTP y del correo electrónico
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->isSMTP();
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => false
            )
        );
        $mail->Host = $_ENV['MAIL_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['MAIL_ADDRESS'];
        $mail->Password = $_ENV['MAIL_PASSWORD'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;  // Habilitar encriptación TLS
        $mail->Port = 25;

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->addCustomHeader('Content-Type: text/html; charset=UTF-8');
        $mail->SMTPDebug = 0;

        // Configurar los destinatarios, el asunto y el cuerpo del correo electrónico
        $mail->setFrom($_ENV['MAIL_ADDRESS'], $_ENV['MAIL_NAME']);
        foreach ($destinatarios as $email)
            $mail->addAddress($email);

        $mail->isHTML($isHTML);

        $mail->Subject = $subject;
        $mail->Body = $body;

        // Enviar el correo electrónico
        return $mail->send();
    } catch (PHPMailerException $e) {
        return ['message' => $e->getMessage(), 'error' => true];
    }
}

function enviarMailAlertas($cod_alerta = null) {
    $alertas = obtenerAlertasParam($cod_alerta);

    foreach ($alertas as $alerta) {
        $cod_alertagest = $alerta->cod_alertagest;

        $alerta_gest = obtenerAlertasGestionParam($cod_alertagest);
        if (count($alerta_gest) <= 0) {
            continue;
        }

        if (!(
            str_contains($alerta_gest[0]->tipo_alerta, 'mail') &&
                $alerta_gest[0]->destinatarios_mail != ''
        )) {
            continue;
        } 
        $destinatarios = explode(';', $alerta_gest[0]->destinatarios_mail);

        $nombre_imagen = $alerta->imagen ?? null;
        $ruta_foto = $nombre_imagen ? sprintf("%s/%s", $_SERVER["DOCUMENT_ROOT"], $nombre_imagen): null;

        $matricula = $alerta->matricula;
        $direccion = $alerta->direccion ?? "";
        $dispositivo = $alerta->nom_dispositivo;

        $subject = "ALERTA: $matricula - {$alerta_gest[0]->nombre_alerta}. ($direccion)";
        $body = <<<MAIL
        <p>MATRICULA: {$matricula}</p> 
        <p>INCIDENCIA: {$alerta_gest[0]->nombre_alerta}. </p> 
        <p>LUGAR: {$direccion}</p> 
        <p>FOTO: {$nombre_imagen}</p> 
        <p>DISPOSITIVO: {$dispositivo}</p> <br/>
        <p>Atentamente,</p>
        <p>Equipo ION</p>
        MAIL;

        enviarCorreo(
            subject: $subject,
            body: $body,
            address: $destinatarios,
            attachment: $ruta_foto,
        );
    }
}
