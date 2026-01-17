from app import create_app

app = create_app()

if __name__ == '__main__':
    # Mode production pour Docker
    app.run(host='0.0.0.0', port=5001, debug=False)
