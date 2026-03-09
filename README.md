 Medical Reminder App

 Overview

The Medical Reminder App is a web application that helps users manage their medications and remember when to take them. The app allows users to create an account, add medications, schedule reminder times, and track whether they have taken or missed their medication.

The goal of the application is to improve medication adherence by providing simple reminders and an easy way to monitor medication history.



 Features

User Authentication – Users can register, log in, and securely manage their medication data.
Medication Management – Add, edit, or delete medications with dosage, reminder time, and duration.
Reminder Notifications – The system sends notifications when it is time to take medication.
Medication Tracking – Users can mark medications as taken or missed.
Medication History – View past medication logs and adherence history.
Dashboard – Displays today's medications and quick actions.



Technology Stack

Frontend

  React
  TailwindCSS
  Axios

Backend

Django
Django REST Framework

Database

 SQLite

Task Scheduler

Celery / Celery Beat



 System Architecture


React Frontend
      |
REST API
      |
Django Backend
      |
SQLite Database
      |
Reminder Scheduler

Purpose

This application provides a simple and effective way for users to manage their medication schedules, reduce missed doses, and maintain better health habits.
