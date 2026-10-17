from setuptools import setup, find_packages

setup(
    name="ayurveda_system",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "numpy",
        "pandas",
        "scikit-learn",
        "joblib"
    ],
    author="Your Name",
    author_email="your.email@example.com",
    description="An Ayurvedic therapy recommendation system",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
)