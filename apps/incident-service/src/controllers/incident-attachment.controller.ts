
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  AttachmentIncidentNotFoundError,
  UnsupportedAttachmentTypeError,
  uploadIncidentAttachment,
} from '../services/incident-attachment.service.js';

type IncidentAttachmentParams = {
  id: string;
};

export const uploadIncidentAttachmentHandler = async (
  request: FastifyRequest<{ Params: IncidentAttachmentParams }>,
  reply: FastifyReply,
) => {
  let uploadedFile:
    | Awaited<ReturnType<typeof request.file>>
    | undefined;

  try {
    uploadedFile = await request.file();

    if (!uploadedFile) {
      return reply.code(400).send({
        message: 'No file was provided. Upload a file using the "file" field.',
      });
    }

    const attachment = await uploadIncidentAttachment({
      incidentId: request.params.id,
      fileName: uploadedFile.filename,
      mimeType: uploadedFile.mimetype,
      fileStream: uploadedFile.file,
    });

    // Do not expose the internal storage key in the API response.
    const {
      storage_key: _storageKey,
      ...publicAttachment
    } = attachment;

    return reply.code(201).send({
      message: 'Incident attachment uploaded successfully',
      attachment: publicAttachment,
    });
  } catch (error) {
    // Drain an unconsumed stream when validation fails.
    if (uploadedFile && !uploadedFile.file.destroyed) {
      uploadedFile.file.resume();
    }

    const errorCode = (error as { code?: string })?.code;

    if (
      errorCode === 'FST_REQ_FILE_TOO_LARGE' ||
      (error instanceof Error &&
        error.name === 'RequestFileTooLargeError')
    ) {
      return reply.code(413).send({
        message: 'The uploaded file exceeds the 50 MB limit',
      });
    }

    if (error instanceof AttachmentIncidentNotFoundError) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    if (error instanceof UnsupportedAttachmentTypeError) {
      return reply.code(415).send({
        message: error.message,
      });
    }

    request.log.error({ err: error }, 'Incident attachment upload failed');

    return reply.code(500).send({
      message: 'Unable to upload incident attachment',
    });
  }
};
