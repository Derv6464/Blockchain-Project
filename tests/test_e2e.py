from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver import Keys, ActionChains
import chromedriver_autoinstaller
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait as wait
from pyvirtualdisplay import Display
import time
import unittest

display = Display(visible=0, size=(800, 800))
display.start()

chromedriver_autoinstaller.install()
chrome_options = webdriver.ChromeOptions()
options = [
   "--window-size=1200,1200",
    "--ignore-certificate-errors"
]

for option in options:
    chrome_options.add_argument(option)

full_wallet = "0x648242eD89cdfa84Bf880729338d6b29221aa1de"
empyt_wallet = "0xa4266613D205104729e5e08f0f8F454Dce876Bad"
relative_path = './wallets/0x648242eD89cdfa84Bf880729338d6b29221aa1de.json'
absolute_path = os.path.abspath(relative_path)

class TestE2E(unittest.TestCase):
    def setUp(self):
        options = Options()
        self.driver = webdriver.Chrome(options=options)
        self.driver.get("http://127.0.0.1:8080")

    def test_title(self):
        self.assertEqual(self.driver.title, "The Green Lagoon")

    def test_makeWallet(self):
        self.driver.find_element(By.XPATH, "/html/body/div/nav/ul[2]/li[1]/a").click()
        time.sleep(0.5)
        self.driver.find_element(By.ID, "password").send_keys("password")
        self.driver.find_element(By.ID, "createWalletButton").click()
        time.sleep(1)
        #self.driver.find_element(By.XPATH, '//*[@id="downloadKeystore"]/button').click()
        walletAddress = self.driver.find_element(By.ID, "walletAddress").get_property('value')
        privateKey = self.driver.find_element(By.ID, "privateKey").get_property('value')
        keystore = self.driver.find_element(By.ID, "keystore").get_property('value')
        self.assertNotEqual(walletAddress, "")
        self.assertNotEqual(privateKey, "")
        self.assertNotEqual(keystore, "")

    def test_UserCheck(self):
        self.driver.find_element(By.XPATH, "/html/body/div/nav/ul[2]/li[3]/a").click()
        time.sleep(0.5)
        self.driver.find_element(By.ID, "walletAddress").send_keys(full_wallet)
        self.driver.find_element(By.ID, "UserBalanceButton").click()
        time.sleep(15)
        crytpoBalance = self.driver.find_element(By.ID, "cryptoBalance").text
        tokenBalance = self.driver.find_element(By.ID, "tokenBalance").text
        tokenName = self.driver.find_element(By.ID, "tokenName").text
        tokenSymbol = self.driver.find_element(By.ID, "tokenSymbol").text
        tokenDecimals = self.driver.find_element(By.ID, "tokenDecimals").text
        tokenSupply = self.driver.find_element(By.ID, "tokenTotalSupply").text

        self.assertIn("ETH", crytpoBalance)
        self.assertIn("Tickets", tokenBalance)
        self.assertEqual("Token Name: GreenLagoon", tokenName)
        self.assertEqual("Token Symbol: GL", tokenSymbol)
        self.assertEqual("Token Decimals: 0", tokenDecimals)
        self.assertEqual("Token Total Supply: 200", tokenSupply)

    def test_VenueCheck(self):
        self.driver.find_element(By.XPATH, "/html/body/div/nav/ul[2]/li[3]/a").click()
        time.sleep(0.5)
        self.driver.find_element(By.XPATH, "/html/body/main/details[2]/summary").click()
        self.driver.find_element(By.ID, "VenueBalanceButton").click()
        time.sleep(15)
        crytpoBalance = self.driver.find_element(By.ID, "cryptoBalanceVenue").text
        tokenBalance = self.driver.find_element(By.ID, "tokenBalanceVenue").text
        tokenSold = self.driver.find_element(By.ID, "tokenSoldVenue").text
        tokenSupply = self.driver.find_element(By.ID, "tokenTotalSupplyVenue").text
        soldNumber = int(tokenSold.split(" ")[2])
        balanceNumber = int(tokenBalance.split(" ")[2])
        self.assertIn("ETH", crytpoBalance)
        self.assertIn("Tickets", tokenBalance)
        self.assertEqual("Token Total Supply: 200", tokenSupply)
        self.assertEqual(200-balanceNumber, soldNumber)

    def test_DoormanCheckIn(self):
        self.driver.find_element(By.XPATH, "/html/body/div/nav/ul[2]/li[3]/a").click()
        time.sleep(0.5)
        self.driver.find_element(By.XPATH, "/html/body/main/details[3]/summary").click()
        self.driver.find_element(By.ID, "walletAddressDoorman").send_keys(full_wallet)
        self.driver.find_element(By.ID, "DoormanBalanceButton").click()
        time.sleep(10)
        letIn = self.driver.find_element(By.ID, "letIn").text
        self.assertEqual("Let In", letIn)

    def test_DoorManCheckOut(self):
        self.driver.find_element(By.XPATH, "/html/body/div/nav/ul[2]/li[3]/a").click()
        time.sleep(0.5)
        self.driver.find_element(By.XPATH, "/html/body/main/details[3]/summary").click()
        self.driver.find_element(By.ID, "walletAddressDoorman").send_keys(empyt_wallet)
        self.driver.find_element(By.ID, "DoormanBalanceButton").click()
        time.sleep(10)
        letIn = self.driver.find_element(By.ID, "letIn").text
        self.assertEqual("Do Not Let In", letIn)

    def test_BuyTicket(self):
         self.driver.find_element(By.XPATH, "/html/body/div/nav/ul[2]/li[2]/a").click()
         time.sleep(0.5)
         self.driver.find_element(By.ID, "keystoreFile").send_keys(absolute_path)
         #should be private :)
         self.driver.find_element(By.ID, "password").send_keys("glob")
         self.driver.find_element(By.ID, "loadWalletButton").click()
         time.sleep(10)
         currentTicktes = self.driver.find_element(By.ID, "tokenBalance").get_attribute('value')
         self.driver.find_element(By.ID, "amountToPay").send_keys("1")
         self.driver.find_element(By.ID, "buyTokensButton").click()
         time.sleep(5)
         wait(self.driver, 3).until(EC.visibility_of_element_located(("id", "loading")))
         wait(self.driver, 60).until(EC.visibility_of_element_located(("id", "result")))
         ActionChains(self.driver)\
              .key_down(Keys.ESCAPE)\
              .perform()
         self.driver.find_element(By.ID, "loadWalletButton").click()
         time.sleep(5)


         newTicktes = self.driver.find_element(By.ID, "tokenBalance").get_attribute('value')

         self.assertEqual(int(currentTicktes)+1, int(newTicktes))

    def test_RetunTicket(self):
        self.driver.find_element(By.XPATH, "/html/body/div/nav/ul[2]/li[2]/a").click()
        time.sleep(0.5)
        self.driver.find_element(By.ID, "keystoreFile").send_keys(absolute_path)
        #should be private :)
        self.driver.find_element(By.ID, "password").send_keys("glob")
        self.driver.find_element(By.ID, "loadWalletButton").click()
        time.sleep(10)
        currentTicktes = self.driver.find_element(By.ID, "tokenBalance").get_attribute('value')
        self.driver.find_element(By.ID, "amountToSell").send_keys("1")
        self.driver.find_element(By.ID, "sellTokensButton").click()
        time.sleep(5)
        wait(self.driver, 3).until(EC.visibility_of_element_located(("id", "loading")))
        wait(self.driver, 60).until(EC.visibility_of_element_located(("id", "result")))
        ActionChains(self.driver)\
             .key_down(Keys.ESCAPE)\
             .perform()
        self.driver.find_element(By.ID, "loadWalletButton").click()
        time.sleep(5)

        newTicktes = self.driver.find_element(By.ID, "tokenBalance").get_attribute('value')

        self.assertEqual(int(currentTicktes)-1, int(newTicktes))



    def tearDown(self):
        self.driver.close()

if __name__ == '__main__':
    unittest.main()
