'use client';

import CameraComponent from './components/CameraComponent';
const validateApiKey = (key: string | undefined): boolean => {
      toast.error('Upload failed');
                          <div className="container mx-auto px-4 py-8">
                            <header className="text-center mb-8">
                              <h1 className="text-4xl font-bold text-white mb-2">Fanfie</h1>
                              <p className="text-gray-300">Take and share photos easily</p>
                            </header>
                            <div className="max-w-4xl mx-auto">
                              <CameraComponent onCapture={() => {}} />
                            </div>
                          </div>
                        </main>
                      );
                    }
              </div>
            </div>
          ) : (
            <CameraComponent 
              onCapture={handleCapture} 
              disabled={!apiConfigured}
            />
          )}
        </div>
      </div>
    </main>
  );
}
