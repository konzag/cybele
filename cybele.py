# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════╗
║   Το Πρόγραμμα της Κυβελίτσας  🌟           ║
║   Κυνήγι Δαιμόνων για Νηπιαγωγείο           ║
╚══════════════════════════════════════════════╝
Φτιαγμένο με αγάπη από τον νονό της 💙
"""

import time
import sys
import os

# ─── Colorama (προαιρετικό) ───
try:
    import colorama
    from colorama import Fore, Back, Style
    colorama.init(autoreset=True)
    HAS_COLOR = True
except ImportError:
    HAS_COLOR = False
    class _Dummy:
        def __getattr__(self, _): return ''
    Fore = Back = Style = _Dummy()

# ─── Winsound (μόνο Windows) ───
try:
    import winsound
    HAS_SOUND = True
except ImportError:
    HAS_SOUND = False

# ─── Κωδικοποίηση stdout ───
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass


# ══════════════════════════════════════════════
#  ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ
# ══════════════════════════════════════════════

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def pause(t=0.6):
    time.sleep(t)

def beep(freq=800, dur=150):
    if HAS_SOUND:
        try:
            winsound.Beep(freq, dur)
        except Exception:
            pass

def print_slow(text, delay=0.04, color=''):
    """Τυπώνει γράμμα-γράμμα για δραματικό εφέ."""
    line = color + text + Style.RESET_ALL
    for ch in line:
        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def header(title):
    print()
    print(Fore.MAGENTA + Style.BRIGHT + '═' * 50)
    print(Fore.YELLOW  + Style.BRIGHT + f'  {title}')
    print(Fore.MAGENTA + Style.BRIGHT + '═' * 50)
    print()

def bravo():
    beep(880, 120); pause(0.1)
    beep(1047, 120); pause(0.1)
    beep(1319, 200)
    print()
    print_slow('  🌟 ΜΠΡΑΒΟ ΚΥΒΕΛΙΤΣΑ! Τα πήγες υπέρoχα! 🌟', 0.03, Fore.YELLOW + Style.BRIGHT)
    print_slow('  💜 Ο νονός σου είναι πολύ περήφανος! 💜',   0.03, Fore.MAGENTA)
    print()
    input(Fore.CYAN + '  Πάτα ENTER για να συνεχίσεις... ')


# ══════════════════════════════════════════════
#  ΟΘΟΝΗ ΚΑΛΩΣΟΡΙΣΜΑΤΟΣ
# ══════════════════════════════════════════════

WELCOME_ART = r"""
     /\   /\
    ( o   o )
    (  ___  )
    ( /|||\ )
   /`       `\
  |  ΚΥΒΕΛΗ   |
   \_________/
   👾 😊 👾
"""

def welcome_screen():
    clear()
    print(Fore.CYAN + Style.BRIGHT + WELCOME_ART)
    pause(0.3)
    print_slow('  ✨ Γεια σου Κυβελίτσα! ✨', 0.05, Fore.YELLOW + Style.BRIGHT)
    pause(0.4)
    print_slow('  Είσαι έτοιμη να κυνηγήσεις δαίμονες;', 0.04, Fore.MAGENTA)
    pause(0.3)
    print_slow('  (Τα πιο χαριτωμένα δαιμονάκια του κόσμου!)', 0.03, Fore.GREEN)
    print()
    beep(523, 100); beep(659, 100); beep(784, 150)
    input(Fore.CYAN + Style.BRIGHT + '  👉 Πάτα ENTER για να ξεκινήσουμε! ')


# ══════════════════════════════════════════════
#  1) ΚΥΝΗΓΙ ΔΑΙΜΟΝΩΝ
# ══════════════════════════════════════════════

CUTE_MONSTERS = [
    ('👾', 'ΣΠΑΡΚΙ',    Fore.MAGENTA),
    ('👻', 'ΦΑΝΤΑΚΙΑΣ', Fore.WHITE),
    ('🐉', 'ΔΡΑΚΟΥΛΗΣ', Fore.GREEN),
    ('🦊', 'ΑΛΕΠΟΥΔΑΚΙ',Fore.RED),
    ('🐸', 'ΒΑΡΤΡΑΚΟΣ', Fore.GREEN),
]

def game_hunting():
    clear()
    header('👾  ΚΥΝΗΓΙ ΔΑΙΜΟΝΩΝ  👾')
    print_slow('  Έλα να μετρήσουμε τα δαιμονάκια μαζί!', 0.04, Fore.CYAN)
    pause(0.5)

    for i, (emoji, name, color) in enumerate(CUTE_MONSTERS, 1):
        pause(0.4)
        beep(400 + i * 80, 120)
        print()
        print(color + Style.BRIGHT + f'  {emoji}  {emoji}  {emoji}')
        print_slow(f'  Νούμερο {i}! Αυτός είναι ο {name}!', 0.04, color + Style.BRIGHT)
        pause(0.3)
        input(Fore.YELLOW + f'  👉 Πάτα ENTER για να πιάσεις τον {name}! ')
        beep(800, 80); beep(1000, 80); beep(1200, 80)
        print_slow(f'  💥 ΠΙΑΣΤΗΚΕ ο {name}! ΜΠΡΑΒΟ!', 0.04, Fore.YELLOW + Style.BRIGHT)
        pause(0.3)

    print()
    print(Fore.YELLOW + Style.BRIGHT + '  🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉')
    pause(0.2)
    print_slow('  ΤΕΛΕΙΑ! ΕΠΙΑΣΕΣ ΟΛΑ ΤΑ ΔΑΙΜΟΝΑΚΙΑ!', 0.04, Fore.YELLOW + Style.BRIGHT)
    print_slow('  Μέτρησες: ΕΝΑ, ΔΥΟ, ΤΡΙΑ, ΤΕΣΣΕΡΑ, ΠΕΝΤΕ!', 0.04, Fore.CYAN)
    beep(523,100); beep(659,100); beep(784,100); beep(1047,200)
    bravo()


# ══════════════════════════════════════════════
#  2) ΧΡΩΜΑΤΑ
# ══════════════════════════════════════════════

COLOR_BLOCKS = [
    (Fore.RED   + Back.RED,   '🔴', 'ΚΟΚΚΙΝΟ',    '🌹 μήλο'),
    (Fore.BLUE  + Back.BLUE,  '🔵', 'ΜΠΛΕ',       '🌊 θάλασσα'),
    (Fore.GREEN + Back.GREEN, '🟢', 'ΠΡΑΣΙΝΟ',    '🌿 γρασίδι'),
    (Fore.YELLOW+ Back.YELLOW,'🟡', 'ΚΙΤΡΙΝΟ',    '☀️ ήλιος'),
    (Fore.MAGENTA+Back.MAGENTA,'🩷','ΡΟΖ',         '🌸 λουλούδι'),
]

def game_colors():
    clear()
    header('🎨  ΧΡΩΜΑΤΑ  🎨')
    print_slow('  Ας μάθουμε τα χρώματα μαζί!', 0.04, Fore.CYAN)
    pause(0.5)

    for color_code, emoji, name, example in COLOR_BLOCKS:
        pause(0.3)
        print()
        # Μεγάλο μπλοκ χρώματος
        print(color_code + Style.BRIGHT + f'   {emoji}  {emoji}  {emoji}  {emoji}  {emoji}  ' + Style.RESET_ALL)
        print(color_code + Style.BRIGHT + f'   {emoji}        {emoji}  ' + Style.RESET_ALL)
        print(color_code + Style.BRIGHT + f'   {emoji}  {emoji}  {emoji}  {emoji}  {emoji}  ' + Style.RESET_ALL)
        print()
        beep(440 + list([0,200,400,600,800])[COLOR_BLOCKS.index((color_code,emoji,name,example))], 150)
        print_slow(f'  Τι χρώμα είναι αυτό;', 0.04, Fore.WHITE + Style.BRIGHT)
        pause(0.6)
        print_slow(f'  ➡️  Είναι {name}! Σαν το {example}!', 0.04, Style.BRIGHT)
        input(Fore.YELLOW + '  👉 Πάτα ENTER για το επόμενο χρώμα... ')
        print_slow('  🌟 Σωστά! ΜΠΡΑΒΟ!', 0.04, Fore.YELLOW + Style.BRIGHT)

    print()
    print_slow('  🎉 Ξέρεις ΟΛΑ τα χρώματα!', 0.04, Fore.YELLOW + Style.BRIGHT)
    bravo()


# ══════════════════════════════════════════════
#  3) ΑΡΙΘΜΟΙ
# ══════════════════════════════════════════════

NUM_ART = {
    1: ["  ██  ", "  ██  ", "  ██  ", "  ██  ", "  ██  "],
    2: [" ████ ", "    ██", " ████ ", "██    ", " ████ "],
    3: [" ████ ", "    ██", " ████ ", "    ██", " ████ "],
    4: ["██  ██", "██  ██", " █████", "    ██", "    ██"],
    5: [" █████", "██    ", " ████ ", "    ██", " ████ "],
}

NUM_WORDS_GR = ['', 'ΕΝΑ', 'ΔΥΟ', 'ΤΡΙΑ', 'ΤΕΣΣΕΡΑ', 'ΠΕΝΤΕ']
NUM_COLORS   = [None, Fore.RED, Fore.BLUE, Fore.GREEN, Fore.YELLOW, Fore.MAGENTA]

def game_numbers():
    clear()
    header('🔢  ΑΡΙΘΜΟΙ  🔢')
    print_slow('  Ας μάθουμε τους αριθμούς 1 ως 5!', 0.04, Fore.CYAN)
    pause(0.5)

    for n in range(1, 6):
        clear()
        header(f'🔢  ΑΡΙΘΜΟΣ {n}  🔢')
        color = NUM_COLORS[n]
        # ASCII αριθμός
        for row in NUM_ART[n]:
            print(color + Style.BRIGHT + '   ' + row)
        print()
        beep(300 + n * 100, 200)
        pause(0.3)
        # Αστεράκια
        stars = '  ⭐ ' * n
        print(Fore.YELLOW + Style.BRIGHT + stars)
        pause(0.2)
        print()
        print_slow(f'  Αυτός είναι ο αριθμός {n}!', 0.04, color + Style.BRIGHT)
        print_slow(f'  Λέμε: {NUM_WORDS_GR[n]}!', 0.05, Fore.WHITE + Style.BRIGHT)
        print()
        # Μέτρα μαζί
        print(Fore.CYAN + '  Ας μετρήσουμε μαζί: ', end='')
        for i in range(1, n + 1):
            time.sleep(0.4)
            beep(400 + i * 60, 100)
            print(Fore.YELLOW + Style.BRIGHT + f'{i} ', end='', flush=True)
        print(Fore.GREEN + Style.BRIGHT + '✓')
        print()
        input(Fore.YELLOW + '  👉 Πάτα ENTER για τον επόμενο αριθμό... ')

    print()
    print_slow('  🎉 ΤΕΛΕΙΑ! Ξέρεις τους αριθμούς 1-5!', 0.04, Fore.YELLOW + Style.BRIGHT)
    bravo()


# ══════════════════════════════════════════════
#  4) ΤΡΑΓΟΥΔΑΚΙ
# ══════════════════════════════════════════════

# Νότες: (συχνότητα Hz, διάρκεια ms)
MELODY = [
    # "Αστεράκι αστεράκι" (παιδικό)
    (262, 300), (262, 300), (392, 300), (392, 300),
    (440, 300), (440, 300), (392, 600),
    (349, 300), (349, 300), (330, 300), (330, 300),
    (294, 300), (294, 300), (262, 600),
    (392, 300), (392, 300), (349, 300), (349, 300),
    (330, 300), (330, 300), (294, 600),
    (392, 300), (392, 300), (349, 300), (349, 300),
    (330, 300), (330, 300), (294, 600),
    (262, 300), (262, 300), (392, 300), (392, 300),
    (440, 300), (440, 300), (392, 600),
    (349, 300), (349, 300), (330, 300), (330, 300),
    (294, 300), (294, 300), (262, 600),
]

NOTE_ICONS = ['🎵', '🎶', '🎼', '🎵', '🎶']

def game_song():
    clear()
    header('🎵  ΤΡΑΓΟΥΔΑΚΙ  🎵')
    print_slow('  Ακού το τραγουδάκι, Κυβελίτσα!', 0.04, Fore.CYAN)
    print_slow('  (Αστεράκι αστεράκι)', 0.04, Fore.MAGENTA)
    pause(0.5)

    icon_idx = 0
    for freq, dur in MELODY:
        icon = NOTE_ICONS[icon_idx % len(NOTE_ICONS)]
        print(Fore.YELLOW + Style.BRIGHT + f'  {icon} ', end='', flush=True)
        icon_idx += 1
        if icon_idx % 7 == 0:
            print()
        beep(freq, dur)
        time.sleep(0.05)

    print()
    print()
    print_slow('  🎵 🎶 🎵 🎶 🎵 🎶 🎵 🎶 🎵', 0.04, Fore.CYAN)
    pause(0.3)
    print_slow('  Σου άρεσε το τραγουδάκι;', 0.04, Fore.MAGENTA)
    bravo()


# ══════════════════════════════════════════════
#  5) ΑΠΟΧΑΙΡΕΤΙΣΜΟΣ
# ══════════════════════════════════════════════

def farewell():
    clear()
    print()
    print(Fore.YELLOW + Style.BRIGHT + '  🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟')
    pause(0.2)
    print_slow('  Γεια σου Κυβελίτσα!', 0.05, Fore.CYAN + Style.BRIGHT)
    pause(0.3)
    print_slow('  Τα πήγες υπέρoχα! 🌟', 0.04, Fore.YELLOW + Style.BRIGHT)
    pause(0.3)
    print_slow('  Είσαι η καλύτερη κυνηγός δαιμόνων!', 0.04, Fore.MAGENTA + Style.BRIGHT)
    pause(0.3)
    print_slow('  Ο νονός σου σε αγαπά πολύ! 💙', 0.04, Fore.BLUE + Style.BRIGHT)
    pause(0.3)
    print()
    print(Fore.YELLOW + Style.BRIGHT + '  🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟')
    beep(523,150); beep(659,150); beep(784,150); beep(1047,300)
    pause(0.5)
    print()
    print(Fore.CYAN + Style.BRIGHT + WELCOME_ART)
    pause(1)
    sys.exit(0)


# ══════════════════════════════════════════════
#  ΚΕΝΤΡΙΚΟ ΜΕΝΟΥ
# ══════════════════════════════════════════════

MENU_ITEMS = [
    ('1', '👾  ΚΥΝΗΓΙ ΔΑΙΜΟΝΩΝ',    game_hunting),
    ('2', '🎨  ΧΡΩΜΑΤΑ',             game_colors),
    ('3', '🔢  ΑΡΙΘΜΟΙ',             game_numbers),
    ('4', '🎵  ΤΡΑΓΟΥΔΑΚΙ',          game_song),
    ('5', '👋  ΑΠΟΧΑΙΡΕΤΙΣΜΟΣ',      farewell),
]

def main_menu():
    clear()
    print()
    print(Fore.MAGENTA + Style.BRIGHT + '  ╔══════════════════════════════════════╗')
    print(Fore.MAGENTA + Style.BRIGHT + '  ║' + Fore.YELLOW + '   🌟 ΤΙ ΘΕΛΕΙΣ ΝΑ ΚΑΝΟΥΜΕ; 🌟      ' + Fore.MAGENTA + '║')
    print(Fore.MAGENTA + Style.BRIGHT + '  ╚══════════════════════════════════════╝')
    print()
    for key, label, _ in MENU_ITEMS:
        print(Fore.CYAN + Style.BRIGHT + f'     {key})  ' + Fore.WHITE + Style.BRIGHT + label)
        print()
    print(Fore.MAGENTA + Style.BRIGHT + '  ────────────────────────────────────────')
    choice = input(Fore.YELLOW + Style.BRIGHT + '  👉 Πάτα έναν αριθμό (1-5): ').strip()
    return choice

def main():
    welcome_screen()
    while True:
        try:
            choice = main_menu()
            matched = False
            for key, _, func in MENU_ITEMS:
                if choice == key:
                    func()
                    matched = True
                    break
            if not matched:
                beep(200, 200)
                print_slow('  ❓ Πάτα έναν αριθμό από το 1 ως το 5!', 0.03, Fore.RED)
                pause(1)
        except KeyboardInterrupt:
            farewell()
        except EOFError:
            farewell()

if __name__ == '__main__':
    main()
