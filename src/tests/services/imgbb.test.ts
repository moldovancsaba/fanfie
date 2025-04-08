describe('Secure Image Service', () => {
  const mockUUID = 'security-seal-123'

  beforeAll(() => {
    global.crypto = {
      randomUUID: () => mockUUID
    } as Crypto
  })

  test('invalidates unsealed requests', async () => {
    global.fetch = jest.fn(() => 
      Promise.resolve(new Response(null, { status: 403 }))
    )
    
    await expect(uploadImage(new Blob())).resolves.toEqual(
      expect.objectContaining({ error: 'SECURE_UPLOAD_FAILURE' })
    )
  })
})
