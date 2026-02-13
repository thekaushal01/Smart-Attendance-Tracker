# 📚 Smart Attendance Tracker

A modern, AI-powered attendance tracking system designed exclusively for LNCT College students. Get real-time insights, predictions, and smart recommendations to maintain optimal attendance.

![Smart Attendance Tracker](assets/logo.png)

## 🌟 Features

- **Real-Time Analytics**: Instant insights into your attendance patterns across all subjects with beautiful charts and visualizations
- **Smart Predictions**: AI-powered predictions that tell you exactly how many classes you need to attend to reach 75% or 60% thresholds
- **Personalized Recommendations**: Customized suggestions for each subject based on your current attendance
- **Subject-wise Tracking**: Detailed breakdown of attendance for each subject
- **Beautiful Dashboard**: Modern, responsive UI with dark mode support
- **Interactive Charts**: Visual representation of attendance data using Chart.js
- **Export Capabilities**: Download reports as PDF or CSV
- **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Secure**: Your credentials are encrypted and never stored

## 🎨 Landing Page Features

- **Professional Design**: Modern landing page with smooth animations and transitions
- **Stacking Cards**: Feature cards with elegant scroll animations
- **Animated Hero Section**: Eye-catching hero section with animated dashboard mockup
- **Stats Showcase**: Real-time statistics with hover effects
- **Interactive Elements**: Smooth scrolling, parallax effects, and floating shapes

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Chrome browser installed
- Internet connection

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Smart-Attendance-Tracker.git
   cd Smart-Attendance-Tracker
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 📖 Usage

1. **Visit the Landing Page**: Go to `http://localhost:5000` to see the project overview
2. **Launch the App**: Click "Launch App" or navigate to `http://localhost:5000/app`
3. **Enter Credentials**: Input your LNCT portal username and password
4. **Fetch Data**: Click "Fetch Attendance" to retrieve your data
5. **View Analytics**: Explore your attendance dashboard with detailed insights
6. **Get Predictions**: See how many classes you need to attend or can skip
7. **Export Reports**: Download your attendance data as PDF or CSV

## 🛠️ Tech Stack

- **Backend**: Flask (Python web framework)
- **Scraping**: Selenium WebDriver with ChromeDriver
- **Parsing**: BeautifulSoup4
- **Frontend**: HTML5, CSS3, JavaScript
- **Charts**: Chart.js
- **PDF Export**: jsPDF
- **Responsive Design**: Custom CSS with modern animations

## 📂 Project Structure

```
Smart-Attendance-Tracker/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── assets/               # Static assets (logo, images)
│   └── logo.png
├── templates/            # HTML templates
│   ├── landing.html      # Landing page
│   └── index.html        # Dashboard page
└── venv/                 # Virtual environment (not tracked)
```

## 🎯 How It Works

1. **Authentication**: Securely connects to LNCT portal using your credentials
2. **Data Scraping**: Selenium automates browser interaction to fetch attendance data
3. **Data Parsing**: BeautifulSoup extracts and processes the attendance table
4. **Analysis**: Backend calculates statistics and predictions
5. **Visualization**: Frontend displays data with interactive charts
6. **Recommendations**: Smart algorithm provides personalized suggestions

## 📊 Screenshots

### Landing Page
Professional landing page with modern animations and smooth transitions.

### Dashboard
Interactive dashboard with real-time attendance analytics and predictions.

### Charts
Beautiful visualizations showing attendance patterns across all subjects.

## 🔒 Security & Privacy

- Credentials are only used for temporary session authentication
- No data is stored on our servers
- All connections are made directly to LNCT portal
- Session data is cleared after use

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is developed for educational purposes to help LNCT students track their attendance. It is not officially affiliated with LNCT College. Use responsibly and ensure compliance with your institution's policies.

## 👨‍💻 Developer

Developed with ❤️ for LNCT Students

## 🐛 Known Issues

- Requires Chrome browser to be installed
- May need ChromeDriver updates for newer Chrome versions
- Portal structure changes may require code updates

## 🔮 Future Enhancements

- [ ] Email notifications for low attendance
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Attendance trends over time
- [ ] Multi-college support
- [ ] Offline mode
- [ ] Browser extension

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

## 🙏 Acknowledgments

- LNCT College for providing the portal system
- All contributors who helped improve this project
- The open-source community for amazing tools and libraries

---

**Made with ❤️ for LNCT Students**

⭐ Star this repo if you find it helpful!
