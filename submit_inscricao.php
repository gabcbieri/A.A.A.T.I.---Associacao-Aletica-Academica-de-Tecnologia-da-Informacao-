<?php
declare(strict_types=1);

mb_internal_encoding('UTF-8');

$destino = 'gabriellacbarbieri@gmail.com';
$cursosPermitidos = ['ADS', 'TI', 'Ciência de Dados'];
$periodosPermitidos = ['Manhã', 'Tarde', 'Noite', 'EAD'];

function responderErro(int $statusCode, string $titulo, string $mensagem): void
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
    responderErro(405, 'Metodo invalido', 'Use o formulario para enviar sua inscricao.');
}

$website = limpar((string)($_POST['website'] ?? ''));
if ($website !== '') {
    responderErro(400, 'Falha de validacao', 'Nao foi possivel processar sua inscricao.');
}

$formTs = (int)($_POST['form_ts'] ?? 0);
$agora = time();
if ($formTs <= 0 || ($agora - $formTs) < 3 || ($agora - $formTs) > 7200) {
    responderErro(400, 'Falha de validacao', 'Tempo de envio invalido. Recarregue a pagina e tente novamente.');
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
$rateKey = hash('sha256', $ip);
$rateFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'insano_rate_' . $rateKey . '.txt';
if (is_file($rateFile)) {
    $ultimoEnvio = (int)file_get_contents($rateFile);
    if (($agora - $ultimoEnvio) < 20) {
        responderErro(429, 'Aguarde para reenviar', 'Espere alguns segundos antes de tentar novamente.');
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
    responderErro(400, 'Falha de validacao', 'Informe um nome valido.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    responderErro(400, 'Falha de validacao', 'Informe um e-mail valido.');
}

$whatsDigits = preg_replace('/\D+/', '', $whatsapp);
if ($whatsDigits === null || strlen($whatsDigits) < 10 || strlen($whatsDigits) > 13) {
    responderErro(400, 'Falha de validacao', 'Informe um WhatsApp valido com DDD.');
}

if (!in_array($curso, $cursosPermitidos, true)) {
    responderErro(400, 'Falha de validacao', 'Curso invalido. Escolha uma opcao permitida.');
}

if (!in_array($periodo, $periodosPermitidos, true)) {
    responderErro(400, 'Falha de validacao', 'Periodo invalido. Escolha uma opcao permitida.');
}

if ($termos !== 'on') {
    responderErro(400, 'Falha de validacao', 'E necessario confirmar os termos.');
}

if (mb_strlen($mensagem) > 1200) {
    responderErro(400, 'Falha de validacao', 'Mensagem muito longa.');
}

$assunto = 'Nova inscricao - Seja Insano';
$corpo = "Nova inscricao recebida\n\n";
$corpo .= "Nome: {$nome}\n";
$corpo .= "E-mail: {$email}\n";
$corpo .= "WhatsApp: {$whatsapp}\n";
$corpo .= "Curso: {$curso}\n";
$corpo .= "Periodo: {$periodo}\n";
$corpo .= "Mensagem: " . ($mensagem !== '' ? $mensagem : 'Nao informada') . "\n";
$corpo .= "IP: {$ip}\n";
$corpo .= "Data: " . date('d/m/Y H:i:s') . "\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: Insano Form <no-reply@insano.local>';
$headers[] = 'Reply-To: ' . $email;

$enviado = @mail($destino, $assunto, $corpo, implode("\r\n", $headers));
if (!$enviado) {
    responderErro(500, 'Falha no envio', 'Nao foi possivel enviar agora. Tente novamente em alguns minutos.');
}

header('Location: obrigado.html', true, 302);
exit;
