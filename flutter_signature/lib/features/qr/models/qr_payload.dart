class QrPayload {

  final int movementId;

  final String contractId;

  final String step;

  QrPayload({
    required this.movementId,
    required this.contractId,
    required this.step,
  });
}