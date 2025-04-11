import { POST } from '../app/api/upload/route';
import { NextRequest, NextResponse } from 'next/server';

describe('Upload API Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.IMGBB_API_KEY = 'test-key';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should return 400 if no image is provided', async () => {
    const formData = new FormData();
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('No image provided');
  });

  it('should handle successful image upload', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', mockBlob);

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: formData,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          url: 'https://test-url.com/image.jpg'
        }
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data.url).toBe('https://test-url.com/image.jpg');
  });

  it('should handle upload errors', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', mockBlob);

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: formData,
    });

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Upload failed');
  });
});
