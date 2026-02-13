from flask import Flask, render_template, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
from collections import defaultdict

app = Flask(__name__, static_folder='assets', static_url_path='/assets')

# --- Scraper Function (Modified for Web Use) ---
def scrape_attendance(username, password):
    try:
        chrome_options = Options()
        # Optional: Run in headless mode for server environments
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        driver.get("https://portal.lnct.ac.in/Accsoft2/parents/subwiseattn.aspx")

        wait = WebDriverWait(driver, 10)

        username_input = wait.until(EC.presence_of_element_located((By.ID, "ctl00_cph1_txtStuUser")))
        password_input = driver.find_element(By.ID, "ctl00_cph1_txtStuPsw")
        login_button = driver.find_element(By.ID, "btnStuLogin")

        username_input.send_keys(username)
        password_input.send_keys(password)
        login_button.click()

        time.sleep(0.3)
        driver.get("https://portal.lnct.ac.in/Accsoft2/parents/subwiseattn.aspx")
        time.sleep(0.8)

        html = driver.page_source
        soup = BeautifulSoup(html, "html.parser")

        table = soup.find("table", {"id": "ctl00_ContentPlaceHolder1_grdsubwise129"})

        subject_data = defaultdict(lambda: {'total': 0, 'attended': 0})
        total_all = 0
        attended_all = 0
        result_data = {}

        if table:
            rows = table.find_all("tr")[1:]
            for row in rows:
                cols = row.find_all("td")
                if len(cols) >= 4:
                    subject_name = cols[1].text.strip()
                    base_subject = subject_name.split("-")[0].strip()
                    total_classes = int(cols[2].text.strip())
                    attended_classes = int(cols[3].text.strip())

                    subject_data[base_subject]['total'] += total_classes
                    subject_data[base_subject]['attended'] += attended_classes

                    total_all += total_classes
                    attended_all += attended_classes
            
            processed_subjects = []
            for subj, data in subject_data.items():
                total = data['total']
                attended = data['attended']
                percentage = (attended / total * 100) if total > 0 else 0

                needed_75 = 0
                if total > 0 and (attended / total) < 0.75:
                    needed_75 = (0.75 * total - attended) / (1 - 0.75)
                    needed_75 = max(0, int(needed_75 + 1))
                
                needed_60 = 0
                if total > 0 and (attended / total) < 0.6:
                    needed_60 = (0.6 * total - attended) / (1 - 0.6)
                    needed_60 = max(0, int(needed_60 + 1))
                
                can_miss_60 = 0
                if total > 0:
                    can_miss_60 = int(attended / 0.6) - total
                    can_miss_60 = max(0, can_miss_60)

                can_miss_75 = 0
                if total > 0:
                    can_miss_75 = int(attended / 0.75) - total
                    can_miss_75 = max(0, can_miss_75)

                processed_subjects.append({
                    'subject': subj,
                    'total': total,
                    'attended': attended,
                    'percentage': f"{percentage:.2f}",
                    'needed_60': needed_60,
                    'needed_75': needed_75,
                    'can_miss_60': can_miss_60,
                    'can_miss_75': can_miss_75
                })

            overall_percentage = (attended_all / total_all * 100) if total_all > 0 else 0
            
            needed_75_overall = 0
            if total_all > 0 and (attended_all / total_all) < 0.75:
                needed_75_overall = (0.75 * total_all - attended_all) / (1 - 0.75)
                needed_75_overall = max(0, int(needed_75_overall + 1))

            needed_60_overall = 0
            if total_all > 0 and (attended_all / total_all) < 0.6:
                needed_60_overall = (0.6 * total_all - attended_all) / (1 - 0.6)
                needed_60_overall = max(0, int(needed_60_overall + 1))

            can_miss_60_overall = 0
            if total_all > 0:
                can_miss_60_overall = int(attended_all / 0.6) - total_all
                can_miss_60_overall = max(0, can_miss_60_overall)

            can_miss_75_overall = 0
            if total_all > 0:
                can_miss_75_overall = int(attended_all / 0.75) - total_all
                can_miss_75_overall = max(0, can_miss_75_overall)
            
            overall_data = {
                'subject': 'OVERALL',
                'total': total_all,
                'attended': attended_all,
                'percentage': f"{overall_percentage:.2f}",
                'needed_60': needed_60_overall,
                'needed_75': needed_75_overall,
                'can_miss_60': can_miss_60_overall,
                'can_miss_75': can_miss_75_overall
            }
            
            result_data = {
                "status": "success",
                "subjects": processed_subjects,
                "overall": overall_data
            }

        else:
            result_data = {"status": "error", "message": "Attendance table not found. Please check your credentials."}

        driver.quit()
        return result_data
    except Exception as e:
        return {"status": "error", "message": f"An error occurred: {e}"}

@app.route("/")
def landing():
    """Serves the landing/marketing page."""
    return render_template("landing.html")

@app.route("/app")
def app_dashboard():
    """Serves the main attendance analyzer dashboard."""
    return render_template("index.html")

@app.route("/fetch_attendance", methods=["POST"])
def fetch_attendance():
    """Endpoint to trigger the scraping process."""
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"status": "error", "message": "Username and password are required."}), 400
    
    result = scrape_attendance(username, password)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)