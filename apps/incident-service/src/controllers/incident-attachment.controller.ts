import type { FastifyReply, FastifyRequest } from 'fastify';
import { createReadStream } from 'node:fs';

import {
  AttachmentIncidentNotFoundError,
  UnsupportedAttachmentTypeError,
  uploadIncidentAttachment,
  getIncidentAttachment,
  listIncidentAttachments,
  IncidentAttachmentNotFoundError,
  IncidentAttachmentFileMissingError,
} from '../services/incident-attachment.service.js';
import { InvalidFileSignatureError } from '../storage/local-file-storage.js';


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

    if (error instanceof InvalidFileSignatureError) {
      return reply.code(415).send({
        message: error.message,
      });
    }

    request.log.error({ err: error }, 'Incident attachment upload failed');
    // console.error('[ATTACHMENT UPLOAD ERROR]', error);
    // console.error(
    //   '[ATTACHMENT UPLOAD STACK]',
    //   error instanceof Error ? error.stack : String(error),
    // );

    // Handle requests without valid multipart file content.
    // if (
    //   error instanceof Error &&
    //   error.message.toLowerCase().includes('multipart')
    // ) {
    //   return reply.code(400).send({
    //     message: 'No file was provided. Upload a file using the "file" field.',
    //   });
    // }

    return reply.code(500).send({
      message: 'Unable to upload incident attachment',
    });
  }
};

type GetIncidentAttachmentParams = {
  id: string;
  attachmentId: string;
};

export const getIncidentAttachmentHandler = async (
  request: FastifyRequest<{
    Params: GetIncidentAttachmentParams;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { attachment, filePath } =
      await getIncidentAttachment(
        request.params.id,
        request.params.attachmentId,
      );

    const safeFileName = attachment.file_name
      .replace(/["\\\r\n]/g, '_');

    reply
      .type(attachment.mime_type)
      .header(
        'Content-Disposition',
        `inline; filename="${safeFileName}"`,
      )
      .header('X-Content-Type-Options', 'nosniff');

    return reply.send(createReadStream(filePath));
  } catch (error) {
    if (error instanceof IncidentAttachmentNotFoundError) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    if (error instanceof IncidentAttachmentFileMissingError) {
      request.log.error(
        { err: error, attachmentId: request.params.attachmentId },
        'Attachment metadata exists but the file is missing',
      );

      return reply.code(404).send({
        message: 'The stored attachment file is missing',
      });
    }

    request.log.error(
      { err: error },
      'Incident attachment retrieval failed',
    );

    return reply.code(500).send({
      message: 'Unable to retrieve incident attachment',
    });
  }
};


export const listIncidentAttachmentsHandler = async (
  request: FastifyRequest<{
    Params: IncidentAttachmentParams;
  }>,
  reply: FastifyReply,
) => {
  try {
    const attachments = await listIncidentAttachments(
      request.params.id,
    );

    // Never expose internal filesystem storage keys.
    const publicAttachments = attachments.map(
      ({
        storage_key: _storageKey,
        ...attachment
      }) => attachment,
    );

    return reply.code(200).send({
      message: 'Incident attachments retrieved successfully',
      count: publicAttachments.length,
      attachments: publicAttachments,
    });
  } catch (error) {
    if (error instanceof AttachmentIncidentNotFoundError) {
      return reply.code(404).send({
        message: 'Incident not found',
      });
    }

    request.log.error(
      { err: error },
      'Failed to list incident attachments',
    );

    return reply.code(500).send({
      message: 'Unable to retrieve incident attachments',
    });
  }
};
