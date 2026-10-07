# NSAC25 SkyChance v2

> **Outdoor Event Weather Risk Evaluator**  
> Plan outdoor events with confidence by calculating the chance that weather conditions exceed your personal comfort levels using historical NASA satellite reanalysis data.

---

## Overview

SkyChance evaluates historical weather disruptions (such as extreme heat, heavy rain, high winds, and high humidity) for specific locations and calendar dates. By leveraging over 10+ years of NASA POWER satellite observation datasets, the app provides non-technical users with clear, probability-based risk assessments.

---

## Features

* **Interactive Map & Search:** Select event locations worldwide via interactive mapping or search.
* **Customizable Comfort Thresholds:** Set personalized limits for precipitation, temperature, wind speed, and humidity.
* **Human-Centered Risk Indicators:** Translates complex climate statistics into intuitive risk summary banners and impact context.
* **NASA POWER API Integration:** Uses historical satellite reanalysis data to calculate realistic probability odds for outdoor events.

---

## Tech Stack

* **Frontend:** React, Tailwind CSS, Leaflet Maps
* **Backend:** Python, Flask, Waitress WSGI
* **Data Source:** NASA POWER API (Prediction Of Worldwide Energy Resources)

---

## Hackathon Team & Acknowledgments

This project was originally created during the **NASA Space Apps Challenge 2025**. Because the initial prototype was developed locally on a shared workspace, all team contributions are credited below:

* **[Hawa Modupe Danso]** – *Frontend Development & UI/UX Design*
* **[Jonathan Umukoro]** – *Backend Architecture & Data Calculations*
* **[Alagie Trawally]** – *NASA POWER API Integration & Analysis*
* **[Temiloluwa James-Akinsulure]** – *Team Leader, Front-End Development & Project Maintainer*

[See Members on official Nasa Space Apps Challenge website](https://www.spaceappschallenge.org/2025/find-a-team/aiuwa-nova/?tab=members)

*Special thanks to the **NASA Space Apps Challenge** organizers and the **NASA POWER Project** for providing public access to global climate datasets.*

---

## Getting Started

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### Local Setup & Execution

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows Git Bash
pip install -r requirements.txt
python run.py
