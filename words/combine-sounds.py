from pydub import AudioSegment
from tqdm import tqdm
import argparse
import os


ALPHABETH = "abcdefghijklmnopqrstuvwxyz"


def load_alphabet(path):
    alphabet = {}
    for letter in ALPHABETH:
        sound = AudioSegment.from_file(f"{path}/{letter}.mp3", format="mp3")
        alphabet[letter] = sound
    return alphabet


def load_words(path, n):
    words = []
    with open(path, "r") as file:
        for i, line in enumerate(file):
            if i == n:
                break
            words.append(line.strip())
    return words


def combine_sounds(alphabet, word):
    sound = AudioSegment.silent(duration=0)
    for letter in word:
        sound += alphabet[letter]
    return sound


def save_sound(sound, path):
    sound.export(path, format="mp3")


def define_parser():
    parser = argparse.ArgumentParser(description="Combine sounds to form words")
    # add short form
    parser.add_argument(
        "-a",
        "--alphabet-path",
        type=str,
        required=True,
        help="Path to the folder containing the alphabet sounds",
    )
    parser.add_argument(
        "-w",
        "--words-file",
        type=str,
        required=True,
        help="Path to the file containing the words",
    )
    parser.add_argument(
        "-n",
        "--first-n",
        type=int,
        default=999999999,
        help="Number of words to process",
    )
    parser.add_argument(
        "-o",
        "--output-path",
        type=str,
        default="output",
        help="Path to the folder where the sounds will be saved",
    )
    return parser.parse_args()


def create_output_folder(path):
    if not os.path.exists(path):
        os.makedirs(path)


def main():
    parser = define_parser()
    create_output_folder(parser.output_path)
    alphabet = load_alphabet(parser.alphabet_path)
    words = load_words(parser.words_file, parser.first_n)

    for word in tqdm(words):
        sound = combine_sounds(alphabet, word)
        save_sound(sound, f"{parser.output_path}/{word}.mp3")


if __name__ == "__main__":
    main()
