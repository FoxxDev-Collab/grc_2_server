import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define a file interface to match Multer's file structure
interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

@Injectable()
export class DocumentStorageService {
  private readonly baseStoragePath: string;

  constructor() {
    // Set the base storage path to a directory in the project
    this.baseStoragePath = path.join(process.cwd(), 'storage', 'documents');
    this.ensureStorageDirectoryExists();
  }

  private async ensureStorageDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.baseStoragePath, { recursive: true });
    } catch (error) {
      console.error('Error creating storage directory:', error);
      throw new Error('Failed to create storage directory');
    }
  }

  private getClientStoragePath(clientId: number): string {
    return path.join(this.baseStoragePath, `client_${clientId}`);
  }

  private async ensureClientDirectoryExists(clientId: number): Promise<string> {
    const clientPath = this.getClientStoragePath(clientId);
    try {
      await fs.mkdir(clientPath, { recursive: true });
      return clientPath;
    } catch (error) {
      console.error(`Error creating client directory for client ${clientId}:`, error);
      throw new Error('Failed to create client directory');
    }
  }

  async storeDocument(
    clientId: number,
    file: UploadedFile,
    documentId: number,
    version: string,
  ): Promise<{ filePath: string; fileName: string; fileSize: number }> {
    try {
      const clientPath = await this.ensureClientDirectoryExists(clientId);
      
      // Create a directory for this document if it doesn't exist
      const documentPath = path.join(clientPath, `doc_${documentId}`);
      await fs.mkdir(documentPath, { recursive: true });
      
      // Generate a unique filename to avoid collisions
      const originalExtension = path.extname(file.originalname);
      const uniqueFileName = `${version}_${uuidv4()}${originalExtension}`;
      const filePath = path.join(documentPath, uniqueFileName);
      
      // Write the file to disk
      await fs.writeFile(filePath, file.buffer);
      
      return {
        filePath: filePath,
        fileName: uniqueFileName,
        fileSize: file.size,
      };
    } catch (error) {
      console.error('Error storing document:', error);
      throw new Error('Failed to store document');
    }
  }

  async getDocument(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      console.error('Error retrieving document:', error);
      throw new Error('Failed to retrieve document');
    }
  }

  async deleteDocument(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  async listClientDocuments(clientId: number): Promise<string[]> {
    try {
      const clientPath = this.getClientStoragePath(clientId);
      
      try {
        await fs.access(clientPath);
      } catch {
        // Directory doesn't exist, return empty array
        return [];
      }
      
      const documentDirs = await fs.readdir(clientPath);
      const documents: string[] = [];
      
      for (const dir of documentDirs) {
        const docPath = path.join(clientPath, dir);
        const stats = await fs.stat(docPath);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(docPath);
          documents.push(...files.map(file => path.join(docPath, file)));
        }
      }
      
      return documents;
    } catch (error) {
      console.error('Error listing client documents:', error);
      throw new Error('Failed to list client documents');
    }
  }
}