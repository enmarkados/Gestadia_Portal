import UIKit
import Capacitor
import GoogleSignIn

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = GestadiaViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts where GIDSignIn.sharedInstance.handle(context.url) { return }
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

// Forward the keyboard's target geometry/timing before it starts moving.
// Keyboard.resize is none on iOS, so only the HTML shell adjusts its height.
class GestadiaViewController: CAPBridgeViewController {
    private var keyboardObserver: NSObjectProtocol?
    private var keyboardFrame = CGRect.null

    override func viewDidLoad() {
        super.viewDidLoad()
        keyboardObserver = NotificationCenter.default.addObserver(
            forName: UIResponder.keyboardWillChangeFrameNotification, object: nil, queue: .main
        ) { [weak self] notification in
            guard let self = self,
                  let info = notification.userInfo,
                  let frame = (info[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue else { return }
            self.keyboardFrame = frame
            let duration = (info[UIResponder.keyboardAnimationDurationUserInfoKey] as? NSNumber)?.doubleValue ?? 0
            let curve = (info[UIResponder.keyboardAnimationCurveUserInfoKey] as? NSNumber)?.intValue ?? 0
            self.sendKeyboardFrame(duration: duration, curve: curve)
        }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // Covers orientation/window changes without replaying a keyboard animation.
        sendKeyboardFrame(duration: 0, curve: 0)
    }

    private func sendKeyboardFrame(duration: Double, curve: Int) {
        guard let webView = webView, let window = webView.window else { return }
        let frameInWindow = window.convert(keyboardFrame, from: window.screen.coordinateSpace)
        let frame = webView.convert(frameInWindow, from: window)
        let intersection = webView.bounds.intersection(frame)
        let docked = !intersection.isNull && intersection.maxY >= webView.bounds.maxY - 1
            && intersection.width >= webView.bounds.width * 0.5
        let overlap = docked ? intersection.height : 0
        let height = max(1, webView.bounds.height - overlap)
        let detail: [String: Any] = ["viewportHeight": height, "duration": duration, "curve": curve, "keyboardVisible": overlap > 0]
        guard let data = try? JSONSerialization.data(withJSONObject: detail),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("window.dispatchEvent(new CustomEvent('gestadiaKeyboardFrame', {detail: \(json)}));", completionHandler: nil)
    }

    deinit {
        if let observer = keyboardObserver { NotificationCenter.default.removeObserver(observer) }
    }
}
