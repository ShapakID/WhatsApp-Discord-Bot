/**
 * Support Vector Regression (SVR) - Dibuat Dari Nol (From Scratch)
 * Menggunakan pendekatan Sub-Gradient Descent (Linear Kernel)
 * Didesain khusus untuk Tugas Akhir Statistika & Probabilitas
 */

class LinearSVR {
    /**
     * @param {number} C - Parameter regulasi (Penalty). Semakin tinggi, semakin fit ke data.
     * @param {number} epsilon - Batas margin toleransi error (tube).
     * @param {number} lr - Learning Rate untuk Gradient Descent.
     * @param {number} epochs - Jumlah iterasi training.
     */
    constructor(C = 100.0, epsilon = 0.1, lr = 0.001, epochs = 10000) {
        this.C = C;
        this.epsilon = epsilon;
        this.lr = lr;
        this.epochs = epochs;
        this.w = 0.0; // Slope (b)
        this.b = 0.0; // Intercept (a)
    }

    /**
     * Melatih model SVR menggunakan dataset X dan y.
     * @param {number[]} X - Array fitur (Hari ke-X)
     * @param {number[]} y - Array target (Jumlah Trafik)
     */
    fit(X, y) {
        const n = X.length;
        if (n === 0) return;

        // 1. Hitung Rata-rata X (X_mean) untuk Normalisasi agar Cepat Konvergen
        const xMean = X.reduce((sum, val) => sum + val, 0) / n;
        const X_norm = X.map(x => x - xMean);

        this.w = 0.0;
        this.b = 0.0;

        // 2. Sub-Gradient Descent
        for (let epoch = 0; epoch < this.epochs; epoch++) {
            for (let i = 0; i < n; i++) {
                const xi = X_norm[i];
                const yi = y[i];

                // Persamaan Linear: f(x) = w * x + b
                const prediction = this.w * xi + this.b;
                const error = yi - prediction;

                // 3. Cek apakah error melampaui margin epsilon (tube)
                if (Math.abs(error) >= this.epsilon) {
                    if (error > 0) {
                        // Data berada di atas margin atas (Under-estimated)
                        // Gradient dL/dw = w - C*xi, dL/db = -C
                        this.w = this.w - this.lr * (this.w - this.C * xi);
                        this.b = this.b - this.lr * (-this.C);
                    } else {
                        // Data berada di bawah margin bawah (Over-estimated)
                        // Gradient dL/dw = w + C*xi, dL/db = C
                        this.w = this.w - this.lr * (this.w + this.C * xi);
                        this.b = this.b - this.lr * (this.C);
                    }
                } else {
                    // Data berada di DALAM margin (Sesuai/Aman) -> Loss = 0 (hanya penalty bobot w)
                    this.w = this.w - this.lr * this.w;
                }
            }
        }

        // 4. Denormalisasi persamaan agar sesuai dengan X asli
        // y = w * (X - X_mean) + b_norm
        // y = w * X - w * X_mean + b_norm -> Intercept asli = b_norm - w * X_mean
        this.coef = this.w;
        this.intercept = this.b - (this.w * xMean);
    }

    /**
     * Memprediksi nilai Y berdasarkan X baru
     */
    predict(X) {
        return X.map(x => this.coef * x + this.intercept);
    }
}

module.exports = LinearSVR;
