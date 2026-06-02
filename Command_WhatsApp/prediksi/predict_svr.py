# Trigger Sync STB
import sys
import json
import pandas as pd
import numpy as np
from sklearn.svm import SVR
import os
import matplotlib
matplotlib.use('Agg') # Gunakan backend non-GUI agar tidak error di server/STB
import matplotlib.pyplot as plt
import warnings

# Abaikan warning dari library
warnings.filterwarnings('ignore')

def run():
    limit = 1000
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except:
            pass
            
    csv_path = os.path.join(os.path.dirname(__file__), '../../traffic_log.csv')
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(json.dumps({"error": f"Gagal membaca CSV: {e}"}))
        return

    if len(df) <= 1:
        print(json.dumps({"error": "Data masih kosong."}))
        return

    # Pastikan data string
    df['datetime'] = df['datetime'].astype(str)
    # Buat kolom tanggal
    df['date'] = df['datetime'].str.split(' ').str[0]
    
    # Rekap per hari
    daily_wa_dm = df[(df['platform'] == 'WhatsApp') & (df['chat_type'] == 'Pribadi')].groupby('date').size()
    daily_wa_gc = df[(df['platform'] == 'WhatsApp') & (df['chat_type'] == 'Grup')].groupby('date').size()
    daily_dc = df[df['platform'] == 'Discord'].groupby('date').size()
    daily_all = df.groupby('date').size()

    dates = sorted(list(df['date'].unique()))
    n = len(dates)

    def train_svr(series):
        # Isi missing dates dengan 0
        y_vals = []
        for d in dates:
            y_vals.append(series.get(d, 0))
            
        X = np.array(range(1, n + 1)).reshape(-1, 1)
        y = np.array(y_vals)
        
        # C=100 agar cukup responsif terhadap perubahan trend
        model = SVR(kernel='linear', C=100.0)
        
        # Jika data kurang dari 2 atau y nilainya konstan 0, return default
        if n < 2 or sum(y) == 0:
            return {"a": 0.0, "b": 0.0, "avg": float(np.mean(y)) if n > 0 else 0.0}
            
        model.fit(X, y)
        b = float(model.coef_[0][0])
        a = float(model.intercept_[0])
        avg = float(np.mean(y))
        
        return {"a": a, "b": b, "avg": avg}

    reg_wa_dm = train_svr(daily_wa_dm)
    reg_wa_gc = train_svr(daily_wa_gc)
    reg_dc = train_svr(daily_dc)
    reg_all = train_svr(daily_all)
    
    output = {
        "n": n,
        "dates": dates,
        "recentDates": dates[-10:],
        "regWA_DM": reg_wa_dm,
        "regWA_GC": reg_wa_gc,
        "regDC": reg_dc,
        "regAll": reg_all,
        "dailyWA_DM": {d: int(daily_wa_dm.get(d, 0)) for d in dates},
        "dailyWA_GC": {d: int(daily_wa_gc.get(d, 0)) for d in dates},
        "dailyDC": {d: int(daily_dc.get(d, 0)) for d in dates},
        "totalWA_DM": int(daily_wa_dm.sum()),
        "totalWA_GC": int(daily_wa_gc.sum()),
        "totalDC": int(daily_dc.sum()),
        "totalAll": int(daily_all.sum()),
        "stbLimit": limit,
        "plot_path": os.path.join(os.path.dirname(__file__), 'svr_plot.png')
    }
    
    # ---------------------------------------------------------
    # GENERATE PLOT DENGAN MATPLOTLIB UNTUK DOKUMEN PDF
    # ---------------------------------------------------------
    try:
        y_all = []
        for d in dates:
            y_all.append(daily_all.get(d, 0))
            
        X_plot = np.array(range(1, n + 1)).reshape(-1, 1)
        y_plot = np.array(y_all)
        y_pred = reg_all["a"] + reg_all["b"] * X_plot.flatten()
        
        plt.figure(figsize=(8, 5))
        plt.plot(X_plot, y_plot, marker='o', linestyle='-', color='blue', label='Trafik Aktual')
        plt.plot(X_plot, y_pred, linestyle='--', color='red', label='SVR Trend Line')
        
        # Tambahkan prediksi 7 hari ke depan
        X_future = np.array(range(n + 1, n + 8))
        y_future = reg_all["a"] + reg_all["b"] * X_future
        plt.plot(X_future, y_future, linestyle=':', color='green', marker='x', label='Prediksi 7 Hari')
        
        plt.title('Support Vector Regression (SVR) - Trafik Bot')
        plt.xlabel('Hari (ke-)')
        plt.ylabel('Jumlah Pesan')
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.6)
        
        # Simpan gambar
        plt.tight_layout()
        plt.savefig(output["plot_path"])
        plt.close()
    except Exception as e:
        output["plot_error"] = str(e)
    
    print(json.dumps(output))

if __name__ == "__main__":
    run()
