export class MonitoringService {
    private static instance: MonitoringService;
    private operations: Map<string, number[]> = new Map();
    private errors: Map<string, number> = new Map();

    private constructor() {}

    static getInstance(): MonitoringService {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }

    startOperation(name: string): number {
        return performance.now();
    }

    endOperation(name: string, startTime: number): void {
        const duration = performance.now() - startTime;
        const times = this.operations.get(name) || [];
        times.push(duration);
        this.operations.set(name, times);

        // Log if operation takes too long
        if (duration > 500) { // 500ms threshold
            console.warn(`Operation ${name} took ${duration}ms to complete`);
        }
    }

    logError(operation: string, error: Error): void {
        const count = (this.errors.get(operation) || 0) + 1;
        this.errors.set(operation, count);
        
        console.error(`Error in ${operation} (occurrence #${count}):`, error);
    }

    getOperationStats(name: string): { avg: number; min: number; max: number } | null {
        const times = this.operations.get(name);
        if (!times || times.length === 0) return null;

        const sum = times.reduce((a, b) => a + b, 0);
        return {
            avg: sum / times.length,
            min: Math.min(...times),
            max: Math.max(...times)
        };
    }

    getErrorCount(operation: string): number {
        return this.errors.get(operation) || 0;
    }

    resetStats(): void {
        this.operations.clear();
        this.errors.clear();
    }
}

export class MonitoringService {
    private static instance: MonitoringService;
    private operations: Map<string, number[]> = new Map();
    private errors: Map<string, number> = new Map();

    private constructor() {}

    static getInstance(): MonitoringService {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }

    startOperation(name: string): number {
        return performance.now();
    }

    endOperation(name: string, startTime: number): void {
        const duration = performance.now() - startTime;
        const times = this.operations.get(name) || [];
        times.push(duration);
        this.operations.set(name, times);

        // Log if operation takes too long
        if (duration > 500) { // 500ms threshold
            console.warn(`Operation ${name} took ${duration}ms to complete`);
        }
    }

    logError(operation: string, error: Error): void {
        const count = (this.errors.get(operation) || 0) + 1;
        this.errors.set(operation, count);
        
        console.error(`Error in ${operation} (occurrence #${count}):`, error);
    }

    getOperationStats(name: string): { avg: number; min: number; max: number } | null {
        const times = this.operations.get(name);
        if (!times || times.length === 0) return null;

        const sum = times.reduce((a, b) => a + b, 0);
        return {
            avg: sum / times.length,
            min: Math.min(...times),
            max: Math.max(...times)
        };
    }

    getErrorCount(operation: string): number {
        return this.errors.get(operation) || 0;
    }

    resetStats(): void {
        this.operations.clear();
        this.errors.clear();
    }
}

