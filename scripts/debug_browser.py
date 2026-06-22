from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Capture console messages
        page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))
        
        print("Opening index.html...")
        page.goto("file:///C:/Python_Training/Reliability-Spec-Engine/index.html")
        page.wait_for_timeout(2000)
        browser.close()

if __name__ == "__main__":
    run()
