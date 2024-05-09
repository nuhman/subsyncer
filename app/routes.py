from flask import render_template, jsonify, request, send_file
from io import BytesIO
import re
from app import app

def parse_timestamp(timestamp):
    hours, minutes, seconds_milliseconds = timestamp.split(':')
    seconds, milliseconds = seconds_milliseconds.split(',')
    return int(hours) * 3600000 + int(minutes) * 60000 + int(seconds) * 1000 + int(milliseconds)

def format_timestamp(timestamp_ms):
    if timestamp_ms < 0:
        timestamp_ms = 0
    hours, remainder = divmod(timestamp_ms, 3600000)
    minutes, remainder = divmod(remainder, 60000)
    seconds, milliseconds = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

def sync_srt(srt_data, offset_ms):
    def sync_timestamp(match):
        start, end = match.groups()
        start_ms = parse_timestamp(start)
        end_ms = parse_timestamp(end)
        start_ms += offset_ms
        end_ms += offset_ms
        start = format_timestamp(start_ms)
        end = format_timestamp(end_ms)
        return f"{start} --> {end}"

    synced_data = re.sub(r"(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})", sync_timestamp, srt_data)
    return synced_data

@app.route('/', methods=['GET', 'POST'])
def index():    
    if request.method == 'POST':
        file = request.files['file']
        offset_str = request.form['offset'].strip()
        if offset_str:
            try:
                offset_ms = int(offset_str)
                if abs(offset_ms) > 10800000:
                    return jsonify({'error': 'Offset value is too large or too small. Please enter a value within ±3 hours.'}), 400
            except ValueError:
                return jsonify({'error': 'Invalid offset value. Please enter an integer value in milliseconds.'}), 400
        else:
            offset_ms = 0  # Default offset of 0 if input is empty
        srt_data = file.read().decode('utf-8')
        synced_data = sync_srt(srt_data, offset_ms)
        buffer = BytesIO()
        buffer.write(synced_data.encode('utf-8'))
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name='synced_subtitles.srt', mimetype='text/srt')

    return render_template('index.html')