import { RecognitionResult } from '../transcript/TranscriptTypes';
import { TranscriptValidationError } from '../errors/SpeechRecognitionErrors';

export class SpeechRecognitionValidator {
  validateResult(result: RecognitionResult): boolean {
    if (!result || typeof result !== 'object') throw new TranscriptValidationError('result', 'Result object is null');
    if (!result.id) throw new TranscriptValidationError('id', 'Missing result ID');
    if (!result.sessionId) throw new TranscriptValidationError('sessionId', 'Missing session ID');
    if (result.sequenceNumber <= 0) throw new TranscriptValidationError('sequenceNumber', 'Invalid sequence number');
    if (Number.isNaN(result.confidence) || result.confidence < 0 || result.confidence > 1) {
      throw new TranscriptValidationError('confidence', 'Confidence must be between 0 and 1');
    }
    return true;
  }
}
