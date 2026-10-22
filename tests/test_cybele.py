# -*- coding: utf-8 -*-
"""Tests for cybele.py (the terminal program), stdlib unittest only.

Run: python3 -m unittest discover -s tests -v
The program is imported as it is (GAME-STANDARD §9: the kids' code is not changed). colorama and winsound are
hidden, as on a machine without them (CI), and sleep / clear screen / input are patched: no waiting, no sound.
"""
import contextlib
import importlib
import io
import os
import sys
import unittest
from unittest import mock

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load():
    """A fresh import of cybele.py without colorama and winsound, with stdout captured."""
    sys.modules.pop('cybele', None)
    with mock.patch.dict(sys.modules, {'colorama': None, 'winsound': None}), \
            mock.patch.object(sys, 'path', [ROOT] + sys.path), \
            contextlib.redirect_stdout(io.StringIO()):
        module = importlib.import_module('cybele')
    sys.modules.pop('cybele', None)
    return module


def play(module, answers):
    """Runs main() with the scripted answers for input(); returns (exit code, everything printed)."""
    out = io.StringIO()
    feed = iter(answers)

    def fake_input(prompt=''):
        out.write(str(prompt))
        try:
            return next(feed)
        except StopIteration:
            raise EOFError from None  # the child closed the window

    with mock.patch.object(module.time, 'sleep'), mock.patch.object(module.os, 'system'), \
            mock.patch('builtins.input', fake_input), contextlib.redirect_stdout(out):
        with self_exit() as code:
            module.main()
    return code[0], out.getvalue()


@contextlib.contextmanager
def self_exit():
    code: list = [None]
    try:
        yield code
    except SystemExit as e:
        code[0] = e.code


class DataTables(unittest.TestCase):
    def setUp(self):
        self.c = load()

    def test_runs_without_colorama_and_winsound(self):
        self.assertFalse(self.c.HAS_COLOR)
        self.assertFalse(self.c.HAS_SOUND)
        self.assertEqual(self.c.Fore.RED + self.c.Style.BRIGHT, '')

    def test_every_monster_and_colour_has_a_name(self):
        self.assertEqual(len(self.c.CUTE_MONSTERS), 5)
        for emoji, name, _colour in self.c.CUTE_MONSTERS:
            self.assertTrue(emoji.strip())
            self.assertTrue(name.strip() and name == name.upper(), name)
        for _code, emoji, name, example in self.c.COLOR_BLOCKS:
            self.assertTrue(emoji.strip() and name.strip() and example.strip(), name)
        names = [b[2] for b in self.c.COLOR_BLOCKS]
        self.assertEqual(len(names), len(set(names)), 'colour names are unique')

    def test_numbers_1_to_5_have_art_word_and_colour(self):
        self.assertEqual(sorted(self.c.NUM_ART), [1, 2, 3, 4, 5])
        for n, rows in self.c.NUM_ART.items():
            self.assertEqual(len(rows), 5, n)
            self.assertEqual({len(r) for r in rows}, {6}, f'rows of {n} have the same width')
        self.assertEqual(self.c.NUM_WORDS_GR, ['', 'ΕΝΑ', 'ΔΥΟ', 'ΤΡΙΑ', 'ΤΕΣΣΕΡΑ', 'ΠΕΝΤΕ'])
        self.assertEqual(len(self.c.NUM_COLORS), 6)

    def test_menu_keys_are_1_to_5_and_callable(self):
        self.assertEqual([k for k, _, _ in self.c.MENU_ITEMS], ['1', '2', '3', '4', '5'])
        for _key, label, func in self.c.MENU_ITEMS:
            self.assertTrue(callable(func), label)
        self.assertTrue(all(f > 0 and d > 0 for f, d in self.c.MELODY))


class ScriptedRounds(unittest.TestCase):
    def setUp(self):
        self.c = load()

    def test_monster_hunt_round_then_goodbye(self):
        # welcome ENTER, menu 1, 5 catches, bravo ENTER, a wrong key, menu 5 (goodbye)
        code, text = play(self.c, ['', '1'] + [''] * 5 + ['', '9', '5'])
        self.assertEqual(code, 0)
        for name in ('ΣΠΑΡΚΙ', 'ΦΑΝΤΑΚΙΑΣ', 'ΔΡΑΚΟΥΛΗΣ', 'ΑΛΕΠΟΥΔΑΚΙ', 'ΒΑΡΤΡΑΚΟΣ'):
            self.assertIn(f'ΠΙΑΣΤΗΚΕ ο {name}! ΜΠΡΑΒΟ!', text)
        self.assertIn('ΤΕΛΕΙΑ! ΕΠΙΑΣΕΣ ΟΛΑ ΤΑ ΔΑΙΜΟΝΑΚΙΑ!', text)
        self.assertIn('ΜΠΡΑΒΟ ΚΥΒΕΛΙΤΣΑ!', text)
        self.assertIn('Πάτα έναν αριθμό από το 1 ως το 5!', text)
        self.assertIn('Ο νονός σου σε αγαπά πολύ!', text)

    def test_every_menu_game_finishes_and_returns_to_the_menu(self):
        # colours: 5 + bravo, numbers: 5 + bravo, song: bravo, then goodbye
        code, text = play(self.c, ['', '2'] + [''] * 6 + ['3'] + [''] * 6 + ['4', '', '5'])
        self.assertEqual(code, 0)
        self.assertIn('Ξέρεις ΟΛΑ τα χρώματα!', text)
        self.assertIn('Ξέρεις τους αριθμούς 1-5!', text)
        self.assertIn('Σου άρεσε το τραγουδάκι;', text)
        self.assertEqual(text.count('ΤΙ ΘΕΛΕΙΣ ΝΑ ΚΑΝΟΥΜΕ;'), 4)

    def test_closing_the_input_says_goodbye_without_an_error(self):
        code, text = play(self.c, [])  # EOF already at the welcome screen
        self.assertEqual(code, 0)
        self.assertIn('Γεια σου Κυβελίτσα!', text)

    def test_closing_the_input_in_a_game_says_goodbye(self):
        code, text = play(self.c, ['', '1', ''])  # EOF while hunting the 2nd monster
        self.assertEqual(code, 0)
        self.assertIn('ΠΙΑΣΤΗΚΕ ο ΣΠΑΡΚΙ!', text)
        self.assertIn('Γεια σου Κυβελίτσα!', text)

    def test_ctrl_c_in_a_game_says_goodbye(self):
        answers = iter(['', '1'])

        def fake_input(prompt=''):
            try:
                return next(answers)
            except StopIteration:
                raise KeyboardInterrupt from None

        out = io.StringIO()
        with mock.patch.object(self.c.time, 'sleep'), mock.patch.object(self.c.os, 'system'), \
                mock.patch('builtins.input', fake_input), contextlib.redirect_stdout(out), self_exit() as code:
            self.c.main()
        self.assertEqual(code[0], 0)
        self.assertIn('Είσαι η καλύτερη κυνηγός δαιμόνων!', out.getvalue())


if __name__ == '__main__':
    unittest.main()
