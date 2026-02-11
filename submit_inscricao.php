<?php
declare(strict_types=1);

mb_internal_encoding('UTF-8');

$destino = 'gabriellacbarbieri@gmail.com';
$cursosPermitidos = ['ADS', 'TI', 'Ciência de Dados'];
$periodosPermitidos = ['Manhã', 'Tarde', 'Noite', 'EAD'];

function responder(int $statusCode, string $titulo, string $mensagem): void
{
    http_response_code($statusCode);
    header('Content-Type: text/html; charset=UTF-8');
    echo '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
    echo '<title>' . htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') . '</title>';
    echo '<style>body{font-family:sans-serif;background:#1c1c1c;color:#fff;padding:40px}a{color:#ff6f00}</style></head><body>';
    echo '<h1>' . htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') . '</h1>';
    echo '<p>' . htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8') . '</p>';
    echo '<p><a href="index.html#sejainsano">Voltar para o formulário</a></p>';
    echo '</body></html>';
    exit;
}

function limpar(string $valor): string
{
    $valor = trim($valor);
    $valor = str_replace(["\r", "\n", "\0"], '', $valor);
    return $valor;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, 'Método inválido', 'Use o formulário para enviar sua inscrição.');
}

$website = limpar((string)($_POST['website'] ?? ''));
if ($website !== '') {
    responder(400, 'Falha de validação', 'Não foi possível processar sua inscrição.');
}

$formTs = (int)($_POST['form_ts'] ?? 0);
$agora = time();
if ($formTs <= 0 || ($agora - $formTs) < 3 || ($agora - $formTs) > 7200) {
    responder(400, 'Falha de validação', 'Tempo de envio inválido. Recarregue a página e tente novamente.');
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
$rateKey = hash('sha256', $ip);
$rateFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'insano_rate_' . $rateKey . '.txt';
if (is_file($rateFile)) {
    $ultimoEnvio = (int)file_get_contents($rateFile);
    if (($agora - $ultimoEnvio) < 20) {
        responder(429, 'Aguarde para reenviar', 'Espere alguns segundos antes de tentar novamente.');
    }
}
@file_put_contents($rateFile, (string)$agora, LOCK_EX);

$nome = limpar((string)($_POST['nome'] ?? ''));
$email = limpar((string)($_POST['email'] ?? ''));
$whatsapp = limpar((string)($_POST['whatsapp'] ?? ''));
$curso = limpar((string)($_POST['curso'] ?? ''));
$periodo = limpar((string)($_POST['periodo'] ?? ''));
$mensagem = trim((string)($_POST['mensagem'] ?? ''));
$termos = (string)($_POST['termos'] ?? '');

if ($nome === '' || mb_strlen($nome) < 5 || mb_strlen($nome) > 120) {
    responder(400, 'Falha de validação', 'Informe um nome válido.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    responder(400, 'Falha de validação', 'Informe um e-mail válido.');
}

$whatsDigits = preg_replace('/\D+/', '', $whatsapp);
if ($whatsDigits === null || strlen($whatsDigits) < 10 || strlen($whatsDigits) > 13) {
    responder(400, 'Falha de validação', 'Informe um WhatsApp válido com DDD.');
}

if (!in_array($curso, $cursosPermitidos, true)) {
    responder(400, 'Falha de validação', 'Curso inválido. Escolha uma opção permitida.');
}

if (!in_array($periodo, $periodosPermitidos, true)) {
    responder(400, 'Falha de validação', 'Período inválido. Escolha uma opção permitida.');
}

if ($termos !== 'on') {
    responder(400, 'Falha de validação', 'É necessário confirmar os termos.');
}

if (mb_strlen($mensagem) > 1200) {
    responder(400, 'Falha de validação', 'Mensagem muito longa.');
}

$assunto = 'Nova inscrição - Seja Insano';
$corpo = "Nova inscrição recebida\n\n";
$corpo .= "Nome: {$nome}\n";
$corpo .= "E-mail: {$email}\n";
$corpo .= "WhatsApp: {$whatsapp}\n";
$corpo .= "Curso: {$curso}\n";
$corpo .= "Período: {$periodo}\n";
$corpo .= "Mensagem: " . ($mensagem !== '' ? $mensagem : 'Não informada') . "\n";
$corpo .= "IP: {$ip}\n";
$corpo .= "Data: " . date('d/m/Y H:i:s') . "\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: Insano Form <no-reply@insano.local>';
$headers[] = 'Reply-To: ' . $email;

$enviado = @mail($destino, $assunto, $corpo, implode("\r\n", $headers));
if (!$enviado) {
    responder(500, 'Falha no envio', 'Não foi possível enviar agora. Tente novamente em alguns minutos.');
}

responder(200, 'Inscrição enviada', 'Recebemos seus dados e a diretoria fará a validação e análise.');
