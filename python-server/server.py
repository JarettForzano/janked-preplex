from flask import Flask, jsonify, request
import asyncio
import httpx
from fastapi import HTTPException
import time
from api.httpx_scrape import fetch_content

# Initialize the Flask application
app = Flask(__name__)

@app.route('/')
def health():
    return 'OK'

@app.route('/api/scrape', methods=['POST'])
async def scrape_urls():
    data = request.get_json()
    urls = data.get('urls')

    if not urls:
        raise HTTPException(status_code=400, detail='No URLs provided')

    start_time = time.time()
    semaphore = asyncio.Semaphore(10)

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        tasks = [fetch_content(client, url, semaphore) for url in urls]
        results = await asyncio.gather(*tasks)

    end_time = time.time()
    total_time = end_time - start_time
    print(f"Total time taken: {total_time} seconds")

    return jsonify({
        'total_time': total_time,
        'results': results
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
