import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:4173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click the '登录后开始' (Login to start) button to proceed to login.
        frame = context.pages[-1]
        # Click the '登录后开始' (Login to start) button to go to login page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password, then submit login form.
        frame = context.pages[-1]
        # Input email address for login.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1062250152@qq.com')
        

        frame = context.pages[-1]
        # Input password for login.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('12345678')
        

        frame = context.pages[-1]
        # Click the login button to submit credentials.
        elem = frame.locator('xpath=html/body/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Correct the email input to '1062250152@qq.com' and retry login by clicking the login button.
        frame = context.pages[-1]
        # Correct the email input to the proper domain 'qq.com'.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1062250152@qq.com')
        

        frame = context.pages[-1]
        # Click the login button to retry login with corrected email.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the '返回首页' (Return to homepage) button to log out or return to the main user interface.
        frame = context.pages[-1]
        # Click the '返回首页' button to return to the main user interface or log out from admin.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Find and click the button or link to navigate to the AI deep psychological analysis purchase page.
        await page.mouse.wheel(0, 300)
        

        # -> Look for a button or link related to DeepSeek AI or AI deep psychological analysis purchase and click it.
        await page.mouse.wheel(0, 300)
        

        # -> Search for any button or link related to DeepSeek AI or AI deep psychological analysis purchase. If not visible, try scrolling more or extracting content to find relevant navigation.
        await page.mouse.wheel(0, 300)
        

        # -> Click the '开始测试' (Start Test) button to explore if it leads to AI deep psychological analysis purchase or related service.
        frame = context.pages[-1]
        # Click the '开始测试' (Start Test) button to proceed to the test or purchase flow.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Check if either test mode requires purchase or leads to purchase page. Click '开始完整测试' (Start Complete Test) button to explore if it leads to purchase or payment.
        frame = context.pages[-1]
        # Click the '开始完整测试' (Start Complete Test) button to proceed and check for purchase or payment flow.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[2]/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Answer the first question by selecting an option and then click the '下一页' (Next Page) button to proceed through the test.
        frame = context.pages[-1]
        # Select the '中立' (Neutral) option for the first question.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div/div[2]/div/div/div[4]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click the '下一页' (Next Page) button to proceed to the next question page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[4]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select an answer for each question on the current page, then click the '下一页' (Next Page) button to proceed to the next page of the test.
        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 1.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 2.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 3.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[2]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 4.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[2]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 5.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[3]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 6.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[3]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 7.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[4]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 8.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[4]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 9.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[5]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 10.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[5]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the '下一页' (Next Page) button to proceed to the next page of the test.
        frame = context.pages[-1]
        # Click the '下一页' (Next Page) button to proceed to the next page of the test.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[4]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select answers for all questions on page 2, then click the '下一页' (Next Page) button to proceed.
        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 6.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[4]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 6.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[4]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 7.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[5]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 7.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[5]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 8.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[6]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 8.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[6]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 9.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[7]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 9.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[7]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 10.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[8]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 10.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[8]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select an answer for each question on the current page, then click the '下一页' (Next Page) button to proceed to the next page of the test.
        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 1 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 2 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 3 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[2]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 4 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[2]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 5 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[3]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 6 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[3]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 7 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[4]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 8 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[4]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '非常不同意' (Strongly Disagree) for question 9 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[5]/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select '中立' (Neutral) for question 10 on this page.
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[5]/div[2]/div/div/div[3]/label').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Payment Failed: Access Denied').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: The payment process did not complete successfully or user access to AI deep psychological analysis was not granted as expected.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    